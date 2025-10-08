// 共用二维码加载函数：传入游戏名，自动加载对应二维码
function loadWechatQrcode(gameName) {
// 替换成你的用户名（比如xiaowang）
const username = "你的GitHub用户名";
// 生成jsDelivr加速链接（国内访问快）
const qrcodeUrl = `https://cdn.jsdelivr.net/gh/${username}/${username}@main/${gameName}/qrcode/game${gameName.toUpperCase()}-qrcode.png`;
// 给页面中的二维码图片赋值（需要游戏页面里有class为"qrcode-img"的img标签）
const qrcodeImg = document.querySelector(".qrcode-img");
if (qrcodeImg) {
qrcodeImg.src = qrcodeUrl;
}
}
