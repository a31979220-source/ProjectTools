export interface AppVersionInfo {
  appName: string;
  version: string;
  releaseDate: string;
  buildNumber: string;
  environment: string;
  channel: string;
  author: string;
  description: string;
  setupUrl?: string;
  portableUrl?: string;
  downloadUrl?: string;
  features: string[];
}

export const APP_VERSION_INFO: AppVersionInfo = {
  appName: 'ProjectTools',
  version: '1.0.7',
  releaseDate: '2026-08-01',
  buildNumber: '20260801.v107',
  environment: 'production',
  channel: 'Stable Desktop',
  author: 'ProjectTools Team',
  description: '极简现代清爽风本地项目管理与看板系统',
  setupUrl: 'https://github.com/a31979220-source/ProjectTools/releases/download/v1.0.7/ProjectTools-Setup-1.0.7.exe',
  portableUrl: 'https://github.com/a31979220-source/ProjectTools/releases/download/v1.0.7/ProjectTools-Portable-v1.0.7.zip',
  downloadUrl: 'https://github.com/a31979220-source/ProjectTools/releases/download/v1.0.7/ProjectTools-Setup-1.0.7.exe',
  features: [
    '绿色免安装版与安装版全自动在线热更新支持',
    '新增全自动 Releases CI/CD 发布流与云端极速打包支持',
    '软件支持应用内极速流式下载更新与静默拉起安装',
    '软件图标抠图升级，全量消除外围白框实现透明 Alpha 通道',
    '软件更新弹窗统一经典纯蓝背景与整体极简设计优化',
    '全新的简约商务极简风软件更新弹窗 UI 体验升级',
    '【稍后提醒】与【立即下载更新】明确双按键交互设计',
    '新增 Gitee/GitHub 在线版本热检查与升级提醒机制',
    '一体化无缝 UI，消除模块割裂感与粗重分割线',
    '侧边栏无极拖拽宽度调节 (180px - 480px)',
    '看板 / 甘特图（精确至小时级起止时刻） / 数据统计三视图',
    '本地代码与项目文件夹极速扫描、批量导入与关联',
    'JSON 备份一键导出与还原',
  ],
};

// Compare two version strings e.g. "1.0.1" vs "1.0.0" -> returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
export function compareVersions(v1: string, v2: string): number {
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  remoteVersion: string;
  remoteInfo?: AppVersionInfo;
  source?: string;
  error?: string;
}

function decodeBase64Utf8(base64Str: string): string {
  try {
    const cleanStr = base64Str.replace(/\s/g, '');
    const binaryStr = atob(cleanStr);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return atob(base64Str);
  }
}

export async function checkRemoteUpdate(): Promise<UpdateCheckResult> {
  const currentVersion = APP_VERSION_INFO.version;

  // 1. Gitee API Contents (Fastest in mainland China)
  try {
    const res = await fetch(
      `https://gitee.com/api/v5/repos/zhangxiaokaiKAI/project-tools/contents/public/version.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const json = await res.json();
      let rawText = '';
      if (json.content && json.encoding === 'base64') {
        rawText = decodeBase64Utf8(json.content);
      } else if (typeof json === 'string') {
        rawText = json;
      }
      if (rawText) {
        const data: AppVersionInfo = JSON.parse(rawText);
        if (data && data.version) {
          const hasUpdate = compareVersions(data.version, currentVersion) > 0;
          return {
            hasUpdate,
            currentVersion,
            remoteVersion: data.version,
            remoteInfo: data,
            source: 'Gitee API',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Gitee API version check failed:', e);
  }

  // 2. jsDelivr CDN (GitHub fast mirror)
  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/gh/a31979220-source/ProjectTools@master/public/version.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data: AppVersionInfo = await res.json();
      if (data && data.version) {
        const hasUpdate = compareVersions(data.version, currentVersion) > 0;
        return {
          hasUpdate,
          currentVersion,
          remoteVersion: data.version,
          remoteInfo: data,
          source: 'jsDelivr (GitHub)',
        };
      }
    }
  } catch (e) {
    console.warn('jsDelivr version check failed:', e);
  }

  // 3. GitHub API Contents
  try {
    const res = await fetch(
      `https://api.github.com/repos/a31979220-source/ProjectTools/contents/public/version.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.content && json.encoding === 'base64') {
        const rawText = decodeBase64Utf8(json.content);
        const data: AppVersionInfo = JSON.parse(rawText);
        if (data && data.version) {
          const hasUpdate = compareVersions(data.version, currentVersion) > 0;
          return {
            hasUpdate,
            currentVersion,
            remoteVersion: data.version,
            remoteInfo: data,
            source: 'GitHub API',
          };
        }
      }
    }
  } catch (e) {
    console.warn('GitHub API version check failed:', e);
  }

  return {
    hasUpdate: false,
    currentVersion,
    remoteVersion: currentVersion,
    error: '无法连接到 Gitee 或 GitHub 远程服务器',
  };
}
