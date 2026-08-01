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
  version: '1.2.0',
  releaseDate: '2026-08-02',
  buildNumber: '20260802.v1200',
  environment: 'production',
  channel: 'Stable Desktop',
  author: 'ProjectTools Team',
  description: '极简现代清爽风本地项目管理与看板系统',
  setupUrl: 'https://github.com/xiaokaisk/ProjectTools/releases/download/v1.2.0/ProjectTools-Setup-1.2.0.exe',
  downloadUrl: 'https://github.com/xiaokaisk/ProjectTools/releases/download/v1.2.0/ProjectTools-Setup-1.2.0.exe',
  features: [
    '优化侧边栏 Sidebar 代码排版与格式',
    '应用设置中的软件更新区域重构为简洁优雅的左右对齐布局',
    '支持大图标、详细信息、平铺列表 视图切换时的左右优雅平滑双向滑动动画',
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
  let fallbackResult: UpdateCheckResult | null = null;

  const updateFallback = (res: UpdateCheckResult) => {
    if (!fallbackResult) {
      fallbackResult = res;
    }
  };

  // 1. GitHub Releases Latest API (优先查询 Releases 发布的最新版本)
  try {
    const res = await fetch(
      `https://api.github.com/repos/a31979220-source/ProjectTools/releases/latest?t=${Date.now()}`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const data = await res.json();
      const rawTag = data.tag_name || data.name || '';
      const version = rawTag.replace(/^v/i, '').trim();
      if (version) {
        const setupAsset = data.assets?.find((a: any) => a.name && a.name.endsWith('.exe'));
        const downloadUrl =
          setupAsset?.browser_download_url ||
          `https://github.com/a31979220-source/ProjectTools/releases/download/v${version}/ProjectTools-Setup-${version}.exe`;
        const features = data.body
          ? data.body
              .split('\n')
              .map((l: string) => l.replace(/^[-*#]\s*/, '').trim())
              .filter(Boolean)
          : [];
        const remoteInfo: AppVersionInfo = {
          ...APP_VERSION_INFO,
          version,
          setupUrl: downloadUrl,
          downloadUrl: downloadUrl,
          features: features.length ? features : APP_VERSION_INFO.features,
        };
        const hasUpdate = compareVersions(version, currentVersion) > 0;
        const result: UpdateCheckResult = {
          hasUpdate,
          currentVersion,
          remoteVersion: version,
          remoteInfo,
          source: 'GitHub Release',
        };
        if (hasUpdate) return result;
        updateFallback(result);
      }
    }
  } catch (e) {
    console.warn('GitHub Release API check failed:', e);
  }

  // 2. Gitee Releases Latest API
  try {
    const res = await fetch(
      `https://gitee.com/api/v5/repos/zhangxiaokaiKAI/project-tools/releases/latest?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      const rawTag = data.tag_name || data.name || '';
      const version = rawTag.replace(/^v/i, '').trim();
      if (version) {
        const setupAsset = data.assets?.find((a: any) => a.name && a.name.endsWith('.exe'));
        const downloadUrl =
          setupAsset?.browser_download_url ||
          `https://gitee.com/zhangxiaokaiKAI/project-tools/releases/download/v${version}/ProjectTools-Setup-${version}.exe`;
        const features = data.body
          ? data.body
              .split('\n')
              .map((l: string) => l.replace(/^[-*#]\s*/, '').trim())
              .filter(Boolean)
          : [];
        const remoteInfo: AppVersionInfo = {
          ...APP_VERSION_INFO,
          version,
          setupUrl: downloadUrl,
          downloadUrl: downloadUrl,
          features: features.length ? features : APP_VERSION_INFO.features,
        };
        const hasUpdate = compareVersions(version, currentVersion) > 0;
        const result: UpdateCheckResult = {
          hasUpdate,
          currentVersion,
          remoteVersion: version,
          remoteInfo,
          source: 'Gitee Release',
        };
        if (hasUpdate) return result;
        updateFallback(result);
      }
    }
  } catch (e) {
    console.warn('Gitee Release API check failed:', e);
  }

  // 3. GitHub Contents Raw API (public/version.json)
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
          const result: UpdateCheckResult = {
            hasUpdate,
            currentVersion,
            remoteVersion: data.version,
            remoteInfo: data,
            source: 'GitHub Raw API',
          };
          if (hasUpdate) return result;
          updateFallback(result);
        }
      }
    }
  } catch (e) {
    console.warn('GitHub Raw API check failed:', e);
  }

  // 4. Gitee API Contents (public/version.json)
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
          const result: UpdateCheckResult = {
            hasUpdate,
            currentVersion,
            remoteVersion: data.version,
            remoteInfo: data,
            source: 'Gitee Raw API',
          };
          if (hasUpdate) return result;
          updateFallback(result);
        }
      }
    }
  } catch (e) {
    console.warn('Gitee API check failed:', e);
  }

  // 5. jsDelivr CDN (GitHub fast mirror)
  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/gh/a31979220-source/ProjectTools@master/public/version.json?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data: AppVersionInfo = await res.json();
      if (data && data.version) {
        const hasUpdate = compareVersions(data.version, currentVersion) > 0;
        const result: UpdateCheckResult = {
          hasUpdate,
          currentVersion,
          remoteVersion: data.version,
          remoteInfo: data,
          source: 'jsDelivr CDN',
        };
        if (hasUpdate) return result;
        updateFallback(result);
      }
    }
  } catch (e) {
    console.warn('jsDelivr version check failed:', e);
  }

  if (fallbackResult) {
    return fallbackResult;
  }

  return {
    hasUpdate: false,
    currentVersion,
    remoteVersion: currentVersion,
    error: '无法连接到 Gitee 或 GitHub 远程服务器',
  };
}
