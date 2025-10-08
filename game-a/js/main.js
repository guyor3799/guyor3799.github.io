// 全局变量
let currentUser = null; 
let allUserData = []; 
let unloginQuestionCount = 0; 
const ADMIN_PASSWORD = "cmgk2024"; // 管理员密码，可修改
// 分享海报模板
const POSTER_TEMPLATE = `
    <div id="posterTemplate" style="width: 300px; height: 500px; background: url('https://picsum.photos/id/1060/300/500'); background-size: cover; padding: 20px; color: #8B4513; text-align: center;">
        <h2 style="font-size: 20px; margin: 10px 0;">沧海墨客·墨客小筑</h2>
        <p style="font-size: 14px; margin: 5px 0;">微信号：{wechatNo}</p>
        <p style="font-size: 14px; margin: 5px 0;">昵称：{nickname}</p>
        <p style="font-size: 16px; font-weight: bold; margin: 15px 0;">当前总分：{totalScore}分</p>
        <div style="margin: 20px 0; font-size: 14px; text-align: left; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px;">
            <p>墨痕寻踪：{mohenScore}分</p>
            <p>沧海杯：{canghaiScore}分</p>
            <p>文学问答：{wendaScore}分</p>
        </div>
        <p style="font-size: 12px; margin-top: 30px;">来墨客小筑答文学好题，迎精致好礼</p>
        <div style="margin-top: 20px; font-size: 10px; color: #666;">扫码进入游戏</div>
    </div>
`;

// 内置题库（核心游戏逻辑，未修改）
const questionBank = {
    mohenShi: [
        {
            type: "poemPuzzle",
            title: "诗画解谜：请选择对应诗句（图为月夜孤床）",
            image: "https://picsum.photos/id/1040/300/200",
            options: ["床前明月光", "举头望明月", "明月几时有"],
            answer: "床前明月光",
            score: 10
        },
        {
            type: "poemPuzzle",
            title: "诗画解谜：请选择对应诗句（图为大漠落日）",
            image: "https://picsum.photos/id/1039/300/200",
            options: ["大漠孤烟直", "长河落日圆", "大漠沙如雪"],
            answer: "长河落日圆",
            score: 10
        }
    ],
    mohenCi: [
        {
            type: "authorMatch",
            title: "作者匹配：'知否，知否？应是绿肥红瘦'的作者是？",
            options: ["李清照", "苏轼", "柳永"],
            answer: "李清照",
            score: 10
        },
        {
            type: "authorMatch",
            title: "作者匹配：'大江东去，浪淘尽'的作者是？",
            options: ["苏轼", "辛弃疾", "陆游"],
            answer: "苏轼",
            score: 10
        }
    ],
    canghaiTang: [
        {
            type: "fillBlank",
            title: "请补全诗句：大漠孤烟___，长河落日___",
            options: ["直/圆", "远/亮", "升/落"],
            answer: "直/圆",
            score: 10
        },
        {
            type: "fillBlank",
            title: "请补全诗句：举头望___，低头思___",
            options: ["明月/故乡", "明月/家人", "太阳/故乡"],
            answer: "明月/故乡",
            score: 10
        }
    ],
    canghaiCi: [
        {
            type: "fillBlank",
            title: "请补全词句：但愿人长久，千里共___",
            options: ["婵娟", "明月", "相思"],
            answer: "婵娟",
            score: 10
        },
        {
            type: "fillBlank",
            title: "请补全词句：寻寻觅觅，冷冷清清，凄凄惨惨___",
            options: ["戚戚", "切切", "兮兮"],
            answer: "戚戚",
            score: 10
        }
    ],
    wenda: [
        {
            type: "singleChoice",
            title: "《巴黎圣母院》的作者是？",
            options: ["雨果", "巴尔扎克", "托尔斯泰"],
            answer: "雨果",
            score: 10
        },
        {
            type: "singleChoice",
            title: "《红楼梦》的作者是？",
            options: ["曹雪芹", "罗贯中", "施耐庵"],
            answer: "曹雪芹",
            score: 10
        },
        {
            type: "singleChoice",
            title: "鲁迅的代表作不包括？",
            options: ["《骆驼祥子》", "《呐喊》", "《彷徨》"],
            answer: "《骆驼祥子》",
            score: 10
        },
        {
            type: "singleChoice",
            title: "《西游记》中，孙悟空的第一个师傅是？",
            options: ["菩提祖师", "唐僧", "如来佛祖"],
            answer: "菩提祖师",
            score: 10
        }
    ]
};

// 1. 工具函数（核心逻辑，未修改）
function initUtils() {
    window.showModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "flex";
    };
    window.hideModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none";
    };
    window.showElement = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.remove("hidden");
    };
    window.hideElement = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.classList.add("hidden");
    };
    window.generatePoster = function() {
        if (!currentUser) return;
        let posterHtml = POSTER_TEMPLATE
            .replace("{wechatNo}", currentUser.userInfo?.wechatNo || "游客")
            .replace("{nickname}", currentUser.nickname || currentUser.userInfo.nickname)
            .replace("{totalScore}", currentUser.scores.total)
            .replace("{mohenScore}", currentUser.scores.mohen)
            .replace("{canghaiScore}", currentUser.scores.canghai)
            .replace("{wendaScore}", currentUser.scores.wenda);
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = posterHtml;
        document.body.appendChild(tempContainer);
        if (window.html2canvas) {
            html2canvas(document.getElementById("posterTemplate")).then(canvas => {
                const posterCanvas = document.getElementById("posterCanvas");
                posterCanvas.width = canvas.width;
                posterCanvas.height = canvas.height;
                const ctx = posterCanvas.getContext("2d");
                ctx.drawImage(canvas, 0, 0);
                showModal("posterContainer");
                document.body.removeChild(tempContainer);
            });
        } else {
            alert("海报生成工具未加载，请刷新重试！");
            document.body.removeChild(tempContainer);
        }
    };
    window.updateUserData = function() {
        if (!currentUser) return;
        if (currentUser.nickname?.includes("墨客游客")) {
            localStorage.setItem("guestUser", JSON.stringify(currentUser));
            return;
        }
        const userIndex = allUserData.findIndex(u => u.userInfo.wechatNo === currentUser.userInfo.wechatNo);
        if (userIndex !== -1) {
            allUserData[userIndex] = currentUser;
            localStorage.setItem("mokeUsers", JSON.stringify(allUserData));
            if (localStorage.getItem("rememberedUser")) {
                localStorage.setItem("rememberedUser", JSON.stringify(currentUser));
            }
        }
    };
}

// 2. 新增：游客模式初始化（非微信环境用）
function initGuestMode() {
    let guestUser = JSON.parse(localStorage.getItem("guestUser") || "{}");
    if (!guestUser.nickname) {
        guestUser = {
            nickname: "墨客游客" + Math.random().toString(36).substr(2, 4),
            scores: { total: 0, mohen: 0, canghai: 0, wenda: 0 },
            progress: { mohen: "诗之境第1关", canghai: "基础层0%", wenda: "中国古代文学类0%" },
            achievements: [],
            shareCount: 0
        };
        localStorage.setItem("guestUser", JSON.stringify(guestUser));
    }
    window.addEventListener("beforeunload", () => {
        if (currentUser?.nickname?.includes("墨客游客")) {
            localStorage.setItem("guestUser", JSON.stringify(currentUser));
        }
    });
    currentUser = guestUser;
    showUserMenu();
}

// 3. 新增：URL参数提取工具
function getUrlParam(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    return r ? decodeURIComponent(r[2]) : null;
}

// 4. 新增：手动登录显示函数
function showManualLogin() {
    hideModal("menuTipModal");
    showModal("manualLoginModal");
}

// 5. 新增：手动登录处理（兜底逻辑）
function handleManualLogin() {
    const wechatNo = document.getElementById("wechatNo").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    if (!wechatNo || !nickname) {
        alert("请填写微信号和昵称！");
        return;
    }
    let user = allUserData.find(u => u.userInfo.wechatNo === wechatNo);
    if (!user) {
        user = {
            userInfo: { wechatNo, nickname, isFollow: false, loginStatus: "已登录" },
            scores: { total: 0, mohen: 0, canghai: 0, wenda: 0 },
            progress: { mohen: "诗之境第1关", canghai: "基础层0%", wenda: "中国古代文学类0%" },
            achievements: [],
            shareCount: 0
        };
        allUserData.push(user);
        localStorage.setItem("mokeUsers", JSON.stringify(allUserData));
    }
    currentUser = user;
    localStorage.setItem("rememberedUser", JSON.stringify(user));
    hideModal("manualLoginModal");
    showUserMenu();
}

// 6. 优化：微信登录初始化（JS-SDK适配核心）
function initWechatOfficialAccountLogin() {
    const isWechat = navigator.userAgent.includes("MicroMessenger");
    if (!isWechat) {
        initGuestMode();
        return;
    }
    wx.config({
        debug: false,
        appId: "", 
        timestamp: new Date().getTime(),
        nonceStr: Math.random().toString(36).substr(2, 15),
        signature: "",
        jsApiList: []
    });
    wx.ready(function () {
        try {
            const fromUser = window.wx?._fromUser || getUrlParam("fromUser");
            if (fromUser) {
                completeLogin(fromUser);
            } else {
                showModal("menuTipModal");
            }
        } catch (error) {
            console.error("提取用户标识失败：", error);
            showModal("menuTipModal");
        }
    });
    wx.error(function (err) {
        console.error("JS-SDK初始化错误：", err);
        showModal("menuTipModal");
    });
}

// 7. 登录完成函数（复用，未修改）
function completeLogin(userId) {
    let user = allUserData.find(u => u.userInfo.wechatNo === userId);
    if (!user) {
        const nickname = "墨客用户" + userId.slice(-6);
        user = {
            userInfo: {
                wechatNo: userId,
                nickname: nickname,
                isFollow: true,
                loginStatus: "已登录"
            },
            scores: { total: 0, mohen: 0, canghai: 0, wenda: 0 },
            progress: { mohen: "诗之境第1关", canghai: "基础层0%", wenda: "中国古代文学类0%" },
            achievements: [],
            shareCount: 0
        };
        allUserData.push(user);
        localStorage.setItem("mokeUsers", JSON.stringify(allUserData));
    }
    currentUser = user;
    localStorage.setItem("rememberedUser", JSON.stringify(user));
    showUserMenu();
}

// 8. 初始化用户数据（未修改）
function initUserData() {
    try {
        const storedUsers = localStorage.getItem("mokeUsers");
        allUserData = storedUsers ? JSON.parse(storedUsers) : [];
        const rememberedUser = localStorage.getItem("rememberedUser");
        if (rememberedUser) {
            currentUser = JSON.parse(rememberedUser);
        }
        const storedUnloginCount = localStorage.getItem("unloginQuestionCount");
        unloginQuestionCount = storedUnloginCount ? parseInt(storedUnloginCount) : 0;
    } catch (e) {
        alert("本地存储功能禁用，数据无法保存！请在浏览器设置中开启localStorage");
        allUserData = [];
        unloginQuestionCount = 0;
    }
}

// 9. 显示游戏菜单（未修改）
function showUserMenu() {
    hideModal("menuTipModal");
    hideModal("browserTipModal");
    showElement("gameMenu");
    const userInfoEl = document.getElementById("userInfo");
    const scoreInfoEl = document.getElementById("scoreInfo");
    if (currentUser.nickname?.includes("墨客游客")) {
        if (userInfoEl) userInfoEl.textContent = `游客：${currentUser.nickname}`;
    } else {
        if (userInfoEl) userInfoEl.textContent = `微信号：${currentUser.userInfo.wechatNo} | 昵称：${currentUser.userInfo.nickname}`;
    }
    if (scoreInfoEl) scoreInfoEl.textContent = `当前总分：${currentUser.scores.total}`;
}

// 10. 检查未登录状态（未修改）
function checkUnloginStatus() {
    if (!currentUser || currentUser.nickname?.includes("墨客游客")) return;
    const unloginTip = document.getElementById("unloginTip");
    if (unloginTip) unloginTip.style.display = "block";
    const mohenBtn = document.getElementById("mohenBtn");
    const canghaiBtn = document.getElementById("canghaiBtn");
    const wendaBtn = document.getElementById("wendaBtn");
    if (mohenBtn) mohenBtn.addEventListener("click", () => handleUnloginModuleClick("mohen"));
    if (canghaiBtn) canghaiBtn.addEventListener("click", () => handleUnloginModuleClick("canghai"));
    if (wendaBtn) wendaBtn.addEventListener("click", () => handleUnloginModuleClick("wenda"));
}

function handleUnloginModuleClick(moduleType) {
    if (unloginQuestionCount >= 1) {
        alert("未登录仅可体验1道题，请登录后解锁全部功能！");
        showModal("menuTipModal");
        return;
    }
    enterModule(moduleType, true);
}

// 11. 进入游戏模块（未修改）
function enterModule(moduleType, isUnlogin = false) {
    hideElement("gameMenu");
    hideElement("adminPage");
    const gameContainer = document.getElementById("gameContainer");
    if (!gameContainer) {
        alert("游戏容器未找到，请刷新重试！");
        return;
    }
    showElement("gameContainer");
    let question = null;
    switch(moduleType) {
        case "mohen":
            const mohenQuestions = [...questionBank.mohenShi, ...questionBank.mohenCi];
            question = mohenQuestions[Math.floor(Math.random() * mohenQuestions.length)];
            break;
        case "canghai":
            const canghaiQuestions = [...questionBank.canghaiTang, ...questionBank.canghaiCi];
            question = canghaiQuestions[Math.floor(Math.random() * canghaiQuestions.length)];
            break;
        case "wenda":
            question = questionBank.wenda[Math.floor(Math.random() * questionBank.wenda.length)];
            break;
        default:
            alert("模块类型错误！");
            return;
    }
    renderQuestion(question, moduleType, isUnlogin);
}

// 12. 渲染题目（未修改）
function renderQuestion(question, moduleType, isUnlogin) {
    const gameContainer = document.getElementById("gameContainer");
    if (!gameContainer || !question) return;
    let html = `
        <div class="text-center mb-4">
            <h2 class="text-xl text-[#8B4513]">${question.title}</h2>
            <p class="guide-text">来墨客小筑答文学好题，迎精致好礼</p>
        </div>
    `;
    if (question.type === "poemPuzzle" && question.image) {
        html += `<img src="${question.image}" alt="题目图片" class="w-full max-w-[300px] mx-auto mb-4 rounded">`;
    }
    html += `<div class="flex flex-col gap-3 mb-4">`;
    question.options.forEach((opt, index) => {
        html += `<button class="question-option ancient-btn p-3 rounded" data-index="${index}">${opt}</button>`;
    });
    html += `</div>`;
    html += `<button id="backBtn" class="ancient-btn w-full p-2 rounded">返回主菜单</button>`;
    gameContainer.innerHTML = html;
    document.querySelectorAll(".question-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const selectedOpt = btn.textContent;
            checkAnswer(selectedOpt, question.answer, question.score, moduleType, isUnlogin);
        });
    });
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            hideElement("gameContainer");
            if (currentUser) {
                showElement("gameMenu");
            } else {
                showModal("menuTipModal");
            }
        });
    }
}

// 13. 检查答案（未修改）
function checkAnswer(selected, answer, score, moduleType, isUnlogin) {
    let isCorrect = selected === answer;
    let tipText = "";
    if (isUnlogin) {
        unloginQuestionCount++;
        try {
            localStorage.setItem("unloginQuestionCount", unloginQuestionCount);
        } catch (e) {}
        tipText = isCorrect ? 
            `回答正确！未登录仅可体验1道题，登录后可记录分数并解锁更多题目~` : 
            `回答错误！未登录仅可体验1道题，登录后可记录分数并解锁更多题目~`;
        alert(tipText);
        hideElement("gameContainer");
        showModal("menuTipModal");
        return;
    }
    if (isCorrect) {
        tipText = `回答正确！获得${score}分`;
        switch(moduleType) {
            case "mohen":
                currentUser.scores.mohen += score;
                break;
            case "canghai":
                currentUser.scores.canghai += score;
                break;
            case "wenda":
                currentUser.scores.wenda += score;
                break;
        }
        currentUser.scores.total += score;
        updateUserProgress(moduleType);
        updateUserData();
    } else {
        tipText = `回答错误！正确答案是：${answer}`;
    }
    alert(tipText);
    hideElement("gameContainer");
    showElement("gameMenu");
}

// 14. 更新用户进度（未修改）
function updateUserProgress(moduleType) {
    const score = currentUser.scores[moduleType];
    switch(moduleType) {
        case "mohen":
            currentUser.progress.mohen = score >= 50 ? "词之境第3关" : score >= 20 ? "诗之境第2关" : "诗之境第1关";
            break;
        case "canghai":
            const canghaiPercent = Math.min(Math.floor(score / 10), 100);
            currentUser.progress.canghai = `基础层${canghaiPercent}%`;
            break;
        case "wenda":
            const wendaPercent = Math.min(Math.floor(score / 10), 100);
            currentUser.progress.wenda = `中国古代文学类${wendaPercent}%`;
            break;
    }
}

// 15. 管理员登录（未修改）
function handleAdminLogin() {
    const password = document.getElementById("adminPwd").value.trim();
    if (password === ADMIN_PASSWORD) {
        hideModal("adminLoginModal");
        showAdminPage();
    } else {
        document.getElementById("adminPwdTip").style.display = "block";
    }
}

// 16. 显示管理员页面（未修改）
function showAdminPage() {
    hideElement("gameMenu");
    const adminPage = document.getElementById("adminPage");
    if (!adminPage) return;
    let userTableHtml = `
        <h3 class="text-lg text-[#8B4513] mb-3">用户数据统计（共${allUserData.length}人）</h3>
        <table class="w-full border-collapse mb-4">
            <tr class="bg-[#F5F5DC]">
                <th class="border p-2 text-left">微信号</th>
                <th class="border p-2 text-left">昵称</th>
                <th class="border p-2 text-left">总分</th>
                <th class="border p-2 text-left">进度</th>
            </tr>
    `;
    const sortedUsers = [...allUserData].sort((a, b) => b.scores.total - a.scores.total);
    sortedUsers.forEach(user => {
        userTableHtml += `
            <tr>
                <td class="border p-2">${user.userInfo.wechatNo}</td>
                <td class="border p-2">${user.userInfo.nickname}</td>
                <td class="border p-2">${user.scores.total}</td>
                <td class="border p-2">${user.progress.mohen}</td>
            </tr>
        `;
    });
    userTableHtml += `</table>`;
    userTableHtml += `<button id="adminBackBtn" class="ancient-btn p-2 rounded">返回游戏菜单</button>`;
    adminPage.innerHTML = userTableHtml;
    const adminBackBtn = document.getElementById("adminBackBtn");
    if (adminBackBtn) {
        adminBackBtn.addEventListener("click", () => {
            hideElement("adminPage");
            showElement("gameMenu");
        });
    }
    showElement("adminPage");
}

// 17. 管理员数据搜索（未修改）
function handleSearch() {
    const searchKey = document.getElementById("searchWechat").value.trim().toLowerCase();
    const tableBody = document.getElementById("statTableBody");
    tableBody.innerHTML = "";
    if (!searchKey) {
        loadStatData();
        return;
    }
    const filteredUsers = allUserData.filter(user => 
        user.userInfo.wechatNo.toLowerCase().includes(searchKey) || 
        user.userInfo.nickname.toLowerCase().includes(searchKey)
    );
    if (filteredUsers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="p-2 text-center text-gray-500">未找到匹配用户</td></tr>`;
        return;
    }
    filteredUsers.forEach(user => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-200";
        tr.innerHTML = `
            <td class="p-2">${user.userInfo.wechatNo}</td>
            <td class="p-2">${user.userInfo.nickname}</td>
            <td class="p-2">${user.scores.total}</td>
            <td class="p-2">${user.scores.mohen}</td>
            <td class="p-2">${user.scores.canghai}</td>
            <td class="p-2">${user.scores.wenda}</td>
            <td class="p-2"><input type="text" placeholder="添加备注" class="w-full p-1 border border-gray-300 rounded text-sm"></td>
        `;
        tableBody.appendChild(tr);
    });
}

// 18. 导出Excel（未修改）
function handleExport() {
    if (allUserData.length === 0) {
        alert("暂无用户数据可导出！");
        return;
    }
    const exportData = allUserData.map(user => ({
        "微信号": user.userInfo.wechatNo,
        "昵称": user.userInfo.nickname,
        "总分": user.scores.total,
        "墨痕寻踪分数": user.scores.mohen,
        "沧海杯分数": user.scores.canghai,
        "文学知识问答分数": user.scores.wenda,
        "已解锁成就": user.achievements.join("、") || "无",
        "当前进度": `${user.progress.mohen} | ${user.progress.canghai} | ${user.progress.wenda}`
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "用户数据统计");
    XLSX.writeFile(workbook, `墨客小筑用户数据_${new Date().toLocaleDateString()}.xlsx`);
}

// 19. 加载统计数据（未修改）
function loadStatData() {
    const tableBody = document.getElementById("statTableBody");
    tableBody.innerHTML = "";
    if (allUserData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="p-2 text-center text-gray-500">暂无用户数据</td></tr>`;
        return;
    }
    const sortedUsers = [...allUserData].sort((a, b) => b.scores.total - a.scores.total);
    sortedUsers.forEach(user => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-gray-200";
        tr.innerHTML = `
            <td class="p-2">${user.userInfo.wechatNo}</td>
            <td class="p-2">${user.userInfo.nickname}</td>
            <td class="p-2">${user.scores.total}</td>
            <td class="p-2">${user.scores.mohen}</td>
            <td class="p-2">${user.scores.canghai}</td>
            <td class="p-2">${user.scores.wenda}</td>
            <td class="p-2"><input type="text" placeholder="添加备注" class="w-full p-1 border border-gray-300 rounded text-sm"></td>
        `;
        tableBody.appendChild(tr);
    });
}

// 20. 游戏初始化（整合所有逻辑）
function initGame() {
    initUtils();
    initUserData();
    checkUnloginStatus();

    // 绑定手动登录按钮事件
    const manualLoginBtn = document.getElementById("manualLoginBtn");
    if (manualLoginBtn) manualLoginBtn.addEventListener("click", handleManualLogin);

    // 绑定管理员相关事件
    const adminLoginBtn = document.getElementById("adminLoginBtn");
    const searchBtn = document.getElementById("searchBtn");
    const exportBtn = document.getElementById("exportBtn");
    const backMenuBtn = document.getElementById("backMenuBtn");
    if (adminLoginBtn) adminLoginBtn.addEventListener("click", handleAdminLogin);
    if (searchBtn) searchBtn.addEventListener("click", handleSearch);
    if (exportBtn) exportBtn.addEventListener("click", handleExport);
    if (backMenuBtn) backMenuBtn.addEventListener("click", () => {
        hideElement("adminPage");
        showElement("gameMenu");
    });

    // 绑定分享按钮事件
    const shareBtn = document.getElementById("shareBtn");
    const closePosterBtn = document.getElementById("closePosterBtn");
    if (shareBtn) shareBtn.addEventListener("click", generatePoster);
    if (closePosterBtn) closePosterBtn.addEventListener("click", () => hideModal("posterContainer"));

    // 绑定游戏模块按钮事件（已登录用户）
    if (currentUser && !currentUser.nickname?.includes("墨客游客")) {
        const mohenBtn = document.getElementById("mohenBtn");
        const canghaiBtn = document.getElementById("canghaiBtn");
        const wendaBtn = document.getElementById("wendaBtn");
        if (mohenBtn) mohenBtn.addEventListener("click", () => enterModule("mohen"));
        if (canghaiBtn) canghaiBtn.addEventListener("click", () => enterModule("canghai"));
        if (wendaBtn) wendaBtn.addEventListener("click", () => enterModule("wenda"));
    }

    // 初始化微信登录（最后调用，确保其他元素加载完成）
    initWechatOfficialAccountLogin();
}

// 启动游戏
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
} else {
    initGame();
}