export interface AppVersionInfo {
  appName: string;
  version: string;
  releaseDate: string;
  buildNumber: string;
  environment: string;
  channel: string;
  author: string;
  description: string;
  downloadUrl?: string;
  features: string[];
}

export const APP_VERSION_INFO: AppVersionInfo = {
  appName: 'ProjectTools',
  version: '1.0.1',
  releaseDate: '2026-08-01',
  buildNumber: '20260801.v101',
  environment: 'production',
  channel: 'Stable Desktop',
  author: 'ProjectTools Team',
  description: '极简现代清爽风本地项目管理与看板系统',
  downloadUrl: 'https://gitee.com/zhangxiaokaiKAI/project-tools',
  features: [
    '一体化无缝 UI，消除模块割裂感与粗重分割线',
    '侧边栏无极拖拽宽度调节 (180px - 480px)',
    '看板 / 甘特图（精确至小时级起止时刻） / 数据统计三视图',
    '本地代码与项目文件夹极速扫描、批量导入与关联',
    '鼠标滚轮全域垂直滚动与单个看板列独立内部滚动',
    '全局弹窗根节点 Portal 渲染与全屏精准居中',
    '支持在线比对 Gitee/GitHub 远程最新版本机制',
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

export async function checkRemoteUpdate(): Promise<UpdateCheckResult> {
  const urls = [
    {
      name: 'Gitee API',
      url: `https://gitee.com/api/v5/repos/zhangxiaokaiKAI/project-tools/raw/public/version.json?t=${Date.now()}`,
    },
    {
      name: 'Gitee Raw',
      url: `https://gitee.com/zhangxiaokaiKAI/project-tools/raw/master/public/version.json?t=${Date.now()}`,
    },
    {
      name: 'jsDelivr CDN',
      url: `https://cdn.jsdelivr.net/gh/a31979220-source/ProjectTools@master/public/version.json?t=${Date.now()}`,
    },
    {
      name: 'GitHub Raw',
      url: `https://raw.githubusercontent.com/a31979220-source/ProjectTools/master/public/version.json?t=${Date.now()}`,
    },
  ];

  const currentVersion = APP_VERSION_INFO.version;

  for (const item of urls) {
    try {
      const res = await fetch(item.url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const data: AppVersionInfo = JSON.parse(text);
        if (data && data.version) {
          const hasUpdate = compareVersions(data.version, currentVersion) > 0;
          return {
            hasUpdate,
            currentVersion,
            remoteVersion: data.version,
            remoteInfo: data,
            source: item.name,
          };
        }
      }
    } catch (e) {
      console.warn(`Version check failed for ${item.name}:`, e);
    }
  }

  return {
    hasUpdate: false,
    currentVersion,
    remoteVersion: currentVersion,
    error: '无法连接到 Gitee 或 GitHub 远程服务器（未找到远端版本配置）',
  };
}
