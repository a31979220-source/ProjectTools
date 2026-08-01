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
  downloadUrl?: string;
  features: string[];
}

export const APP_VERSION_INFO: AppVersionInfo = {
  appName: 'ProjectTools',
  version: '1.0.14',
  releaseDate: '2026-08-02',
  buildNumber: '20260802.v1014',
  environment: 'production',
  channel: 'Stable Desktop',
  author: 'ProjectTools Team',
  description: '极简现代清爽风本地项目管理与看板系统',
  setupUrl: 'https://github.com/a31979220-source/ProjectTools/releases/download/v1.0.13/ProjectTools-Setup-1.0.13.exe',
  downloadUrl: 'https://github.com/a31979220-source/ProjectTools/releases/download/v1.0.13/ProjectTools-Setup-1.0.13.exe',
  features: [
    '视图切换按钮优化为下拉框形式，提升操作效率',
    '全面 UI 黑白极简化改造，去除所有非必要彩色装饰',
    '设置页面去除装饰图标，统一黑白配色',
    '优先级选择器与统计面板彩色标识优化',
    '卡片左侧状态指示条保留彩色区分',
    '全局交互细节与视觉体验提升',
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
