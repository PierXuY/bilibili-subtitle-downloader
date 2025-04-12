// 下载字幕
import { extractJsonContentToText, cleanFileName } from './utils.js';

export function downloadSubtitle(url, title, lang_doc, content_type) {
    let downloadContent;
    let file_type = {
        "json": "application/json",
        "txt": "text/plain"
    }

    const fullUrl = url.startsWith('http') ? url : `https:${url}`;
    // 使用 fetch 获取文件内容
    fetch(fullUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // 解析 JSON
        })
        .then(originalJson => {
            if (content_type === 'json') {
                // 格式化 JSON
                downloadContent = JSON.stringify(originalJson, null, 4);
            } else if (content_type === 'txt') {
                // 提取 content 字段并拼接成纯文本
                downloadContent = extractJsonContentToText(originalJson);
            }
            // 创建一个新的文件对象
            const blob = new Blob([downloadContent], { type: file_type[content_type] });
            const objectUrl = URL.createObjectURL(blob);
            // 使用 chrome.downloads.download 下载格式化后的文件
            chrome.downloads.download({
                url: objectUrl,
                filename: `${lang_doc}_${cleanFileName(title)}.${content_type}`,
                saveAs: false
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('下载失败:', chrome.runtime.lastError.message);
                }
                // 释放对象 URL
                URL.revokeObjectURL(objectUrl);
            });
        })
        .catch(error => {
            console.error('下载或格式化失败:', error.message);
        });
}