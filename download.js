import { extractJsonContentToText } from './utils.js';

const CONTENT_TYPE_MAP = Object.freeze({
    json: 'application/json',
    txt: 'text/plain'
});
const VALID_CONTENT_TYPES = new Set(Object.keys(CONTENT_TYPE_MAP));

async function createObjectUrl(url, file_type) {
    if (!VALID_CONTENT_TYPES.has(file_type)) {
        throw new Error(`Invalid content type: ${file_type}`);
    }

    let fullUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);

        const data = await response.json();
        const processedContent = processContent(data, file_type);

        const blob = new Blob([processedContent], {
            type: CONTENT_TYPE_MAP[file_type]
        });

        return URL.createObjectURL(blob);
    } catch (error) {
        throw new Error(`createObjectUrl failed: ${error.message}`);
    }
}

function processContent(data, file_type) {
    switch (file_type) {
        case 'json':
            return JSON.stringify(data, null, 4);
        case 'txt':
            return extractJsonContentToText(data);
        default:
            throw new Error(`Unsupported type: ${file_type}`);
    }
}

export async function downloadSubtitle(file_url, file_name, file_type) {
    let objectUrl = await createObjectUrl(file_url, file_type)

    chrome.downloads.download({
        url: objectUrl,
        filename: file_name,
        saveAs: true
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('downloadSubtitle failed', chrome.runtime.lastError.message);
        }
        // 释放对象 URL
        URL.revokeObjectURL(objectUrl);
    });
}
