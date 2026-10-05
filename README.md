# 痕迹 · Footprints

23 个目的地，各自一段完整场景逐帧小故事。人物从第一帧起就在画面中，动作、环境、水纹、倒影与遮挡通过整幅画面的不同帧共同表现。首页是无人物的浅色贝壳地图，鼠标或触屏点入故事。

## 操作

- 点击地图上的区域打开当地故事；旅行手册可以直接选择全部 23 个地点。
- 拖动地图探索，滚轮或加减按钮缩放，“全景”恢复整体构图。
- 左右按钮切换故事；画框按钮查看原始完整上下海报；暂停按钮停在当前帧。
- 首页微动可单独暂停；系统减少动态效果的设置会默认停止自动播放。
- 浏览印记只保存在本机浏览器，可以清空。

## 当前制作方式与边界

每个地点有独立的六帧图集，按三列两行排列，每帧都是完整的材料景观，不叠加单独的人物素材。播放器只负责切换完整场景帧。作品为定格翻页式动画，不是流畅视频；生成画面仍可能存在细微纹理和构图变化。

当前故事是为了演示而创作的视觉小故事，不表示用户真实做过这些事。艺术地图也不表示真实地理距离或旅行顺序。

## 未来的个人故事接口

films.js 每个地点保留 memory、emotion、personalStory 三个空值，以及 kind: fictional_demo。未来由用户写入自己的记忆、感受和故事，再据此重新设计动画。现在没有推断情绪的程序，也不会把演示情节自动当作自传内容。界面不显示“待填写”空卡，以保持演示完整。

## 本地预览

在本目录运行 `python3 -m http.server 4173`，打开 http://localhost:4173 。

## GitHub Pages

将交付整包解压到仓库根目录，提交并推送至 main。在 Settings → Pages → Source 选择 Deploy from a branch，选择 main 和 /(root)，保存并等待部署。使用相对资源路径，无需构建或 API 密钥。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 文件

- index.html / style.css / dialog.css：界面与全帧播放窗口。
- places.js：地点与分区。
- films.js：独立电影资源、播放时长与未来故事空位。
- app.js：地图交互、全帧播放器、暂停和浏览记录。
- assets/films/：23 个六帧故事图集与首页六帧环境图集。
- assets/posters/：23 张完整上下海报，保留原始交付文件。
- assets/quiet-shell-archipelago.png：地图加载时的静态画面。
- film-prompts.json：内置 imagegen 的生成记录。

只包含展览成品，不含图库导出原片。没有公开部署。
