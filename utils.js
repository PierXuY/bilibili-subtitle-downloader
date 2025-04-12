// 提取 content 字段并拼接成纯文本
export function extractJsonContentToText(jsonData) {
    const contentArray = jsonData.body.map(item => item.content);
    return contentArray.join('\n'); // 每个 content 用换行符分隔
}

// 清理文件名中的非法字符
export function cleanFileName(filename) {
    return filename.replace(/[\s\\/*?:"<>|=\^$#`~]/g, '_');
}

export function extraTitle(tabUrl, INITIAL_STATE) {
    const url = new URL(tabUrl); // 获取当前页面的 URL
    const params = new URLSearchParams(url.search); // 解析查询字符串

    const p = Number(params.get('p')) || 1;
    const title = INITIAL_STATE.videoData.pages.find(item => item.page === p)?.part || "";
    return title
}
