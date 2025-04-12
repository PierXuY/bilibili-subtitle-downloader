import { downloadSubtitle } from './download.js';
import { extraTitle } from './utils.js';

let title;
document.addEventListener('DOMContentLoaded', () => {

    const subtitleH3 = document.getElementById('subtitle-h3');
    const subtitleLinkH3 = document.getElementById('subtitle-link-h3');
    const subtitleList = document.getElementById('subtitle-list');
    const subtitleLinkList = document.getElementById('subtitle-link-list');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        const tabUrl = tabs[0].url;

        if (tabUrl.includes('bilibili.com/video')) {
            // 定义重试次数和计时器
            let retryCount = 0;
            const maxRetryTime = 3000;
            let retryTimer;

            function attemptSendMessage() {
                chrome.tabs.sendMessage(
                    tabId,
                    { action: 'GET_INITIAL_STATE' },
                    (INITIAL_STATE) => {
                        if (chrome.runtime.lastError || !INITIAL_STATE) {
                            console.error('通信失败:', chrome.runtime.lastError);
                            retryCount++;

                            if (retryCount * 500 <= maxRetryTime) {
                                retryTimer = setTimeout(attemptSendMessage, 500);
                            } else {
                                // 超时，显示错误信息
                                subtitleList.innerHTML = '<p>无法获取视频信息，请刷新页面后重试</p>';
                            }
                        } else {
                            clearTimeout(retryTimer);
                            fetchSubtitleData(INITIAL_STATE.aid, INITIAL_STATE.cid);
                            title = extraTitle(tabUrl, INITIAL_STATE);
                        }
                    }
                );
            }

            attemptSendMessage();
        } else {
            subtitleList.innerHTML = '<p>请在哔哩哔哩视频页面使用此扩展</p>';
        }
    });


    // 获取字幕数据
    async function fetchSubtitleData(aid, cid) {
        try {
            const response = await fetch(`https://api.bilibili.com/x/player/wbi/v2?aid=${aid}&cid=${cid}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.data.subtitle.subtitles) {
                const subtitles = data.data.subtitle.subtitles.filter(item => item.subtitle_url);
                renderSubtitles(subtitles);
            } else {
                subtitleList.innerHTML = `<p>获取字幕失败: ${data.message || '未知错误'}</p>`;
            }
        } catch (error) {
            subtitleList.innerHTML = `<p>获取字幕失败: ${error.message}</p>`;
        }
    }

    // 渲染列表
    function renderSubtitles(subtitles) {

        // 优化显示
        (function blockForOneSecond() {
            const start = Date.now();
            while (Date.now() - start < 500) {}
        })()


        subtitleList.innerHTML = '';
        if (subtitles.length === 0) {
            subtitleList.innerHTML = '<p>没有可用的字幕</p>';
            return;
        }

        subtitleH3.innerHTML = `可下载字幕列表`;

        subtitles.forEach(subtitle => {
            const item = document.createElement('div');
            item.className = 'subtitle-item';
            item.innerHTML = `
            <div><strong>${subtitle.lan_doc}</strong> ${subtitle.lan}</div>

            <button class="download-btn" data-url="${subtitle.subtitle_url}" 
            data-lang_doc="${subtitle.lan_doc}" data-content_type="json">JSON</button>

            <button class="download-btn" data-url="${subtitle.subtitle_url}" 
            data-lang_doc="${subtitle.lan_doc}" data-content_type="txt" >TXT</button>
            `;
            subtitleList.appendChild(item);
        });

        // 添加下载按钮事件
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                const lang_doc = btn.getAttribute('data-lang_doc');
                const content_type = btn.getAttribute('data-content_type');
                downloadSubtitle(url, title, lang_doc, content_type);
            });

        });

        subtitleLinkH3.innerHTML = `字幕链接地址`;
        // 链接地址
        subtitles.forEach(subtitle => {
            const item = document.createElement('div');
            item.className = 'subtitle-link-item';
            const url = subtitle.subtitle_url;
            const fullUrl = url.startsWith('http') ? url : `https:${url}`;
            item.innerHTML = `
            <a  class="subtitle-link" href="${fullUrl}" target="_blank"> ${subtitle.lan_doc}</a>
            `;
            subtitleLinkList.appendChild(item);
        }
        )
    }
})