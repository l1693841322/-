// 角色收藏馆 - 主逻辑脚本
// 初始化作品数据
window.works = JSON.parse(localStorage.getItem('works') || '[]');
// =============== 模糊匹配工具函数（导入作品用） ===============

// 计算两个字符串的相似度（0-1之间，1表示完全一样）
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // 完全相等
  if (s1 === s2) return 1;
  
  // 一方包含另一方
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }
  
  // 计算共同子串长度
  let maxCommonLength = 0;
  const len1 = s1.length;
  const len2 = s2.length;
  
  for (let i = 0; i < len1; i++) {
    for (let j = 0; j < len2; j++) {
      let k = 0;
      while (i + k < len1 && j + k < len2 && s1[i + k] === s2[j + k]) {
        k++;
      }
      if (k > maxCommonLength) {
        maxCommonLength = k;
      }
    }
  }
  
  // 相似度 = 共同子串长度 / 较长字符串长度
  return maxCommonLength / Math.max(len1, len2);
}

// 模糊查找角色（返回最匹配的角色，相似度必须大于阈值）
function findCharacterFuzzy(name, threshold = 0.6) {
  if (!name || characters.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  characters.forEach(character => {
    // 直接比较
    const score = stringSimilarity(name, character.name);
    
    // 如果有别名或昵称，可以在这里扩展
    
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = character;
    }
  });
  
  return bestMatch;
}
// 定义权重配置
const WEIGHTS = {
    '感觉': 1.5,
    '相貌': 1.2, '神态': 1.2,
    '气质': 1.0, '腿型': 1.0, '演技': 1.0, '投入': 1.0,
    '皮肤状态': 0.8, '腰臀比': 1.0, '胸型': 1.0,
    '体态': 1.0, '笑容': 0.8, '微表情': 0.8, '声音': 0.8
};

// 14个属性列表 - ✅ 按你的新顺序排列
const ATTRIBUTES = [
    { name: '相貌', weight: 1.2, group: 'weight-medium' },
    { name: '气质', weight: 1.0, group: 'weight-low' },
    { name: '皮肤状态', weight: 0.8, group: 'weight-low' },
    { name: '腰臀比', weight: 1.0, group: 'weight-low' },
    { name: '胸型', weight: 1.0, group: 'weight-low' },
    { name: '腿型', weight: 1.0, group: 'weight-low' },
    { name: '体态', weight: 1.0, group: 'weight-low' },
    { name: '笑容', weight: 0.8, group: 'weight-low' },
    { name: '微表情', weight: 0.8, group: 'weight-low' },
    { name: '声音', weight: 0.8, group: 'weight-low' },
    { name: '神态', weight: 1.2, group: 'weight-medium' },
    { name: '投入', weight: 1.0, group: 'weight-low' },
    { name: '演技', weight: 1.0, group: 'weight-low' },
    { name: '感觉', weight: 1.5, group: 'weight-high' }
];

// 等级配置
const RANK_CONFIG = {
    'UR': { minPercentile: 0, maxPercentile: 10, color: '#ff6b6b', label: 'UR' },
    'SSR': { minPercentile: 10, maxPercentile: 30, color: '#a29bfe', label: 'SSR' },
    'SR': { minPercentile: 30, maxPercentile: 70, color: '#74b9ff', label: 'SR' },
    'R': { minPercentile: 70, maxPercentile: 100, color: '#55efc4', label: 'R' }
};

// 标签颜色映射 - 马卡龙配色
const TAG_COLORS = {
    // 风格类 - 粉色系
    '御姐': '#FFB6C1',      // 浅粉红
    '甜美': '#FFC8DD',      // 泡泡糖粉
    '清纯': '#FFAFCC',      // 婴儿粉
    '性感': '#FF85A1',      // 西瓜红
    '帅气': '#CDB4DB',      // 淡紫
    '可爱': '#FFC8DD',      // 浅粉
    '高冷': '#BDE0FE',      // 淡蓝
    '温柔': '#FFD6FF',      // 薰衣草紫
    '活泼': '#FFAFCC',      // 珊瑚粉
    '优雅': '#D8BFD8',      // 蓟紫
    '知性': '#A2D2FF',      // 天蓝
    '神秘': '#C8A2C8',      // 淡紫罗兰
    '俏皮': '#FFC8DD',      // 粉红
    '端庄': '#DDA0DD',      // 梅红
    '妩媚': '#FF69B4',      // 热粉红
    
    // 类型类 - 蓝色/紫色系
    '演员': '#A2D2FF',      // 天蓝
    '偶像': '#BDE0FE',      // 淡蓝
    '模特': '#CDB4DB',      // 淡紫
    '网红': '#FFAFCC',      // 浅珊瑚
    '虚拟偶像': '#C8A2C8',  // 淡紫罗兰
    '歌手': '#A2D2FF',      // 天蓝
    '舞者': '#FFC8DD',      // 浅粉
    '声优': '#BDE0FE',      // 淡蓝
    '主播': '#FFD6FF',      // 淡粉紫
    '艺人': '#CDB4DB',      // 淡紫
    '运动员': '#A2D2FF',    // 天蓝
    '主持人': '#D8BFD8',    // 蓟紫
    
    // 场景类 - 绿色/黄色系
    '古装': '#CCD5AE',      // 淡绿
    '现代': '#E9EDC9',      // 淡黄绿
    '职场': '#FEFAE0',      // 象牙白
    '校园': '#FAEDCD',      // 淡杏
    '运动': '#D4A373',      // 淡棕
    '礼服': '#FEC5BB',      // 淡桃
    '日常': '#FCD5CE',      // 淡桃红
    '舞台': '#FFE5D9',      // 杏仁白
    '古风': '#CCD5AE',      // 淡绿
    '现代风': '#E9EDC9',    // 淡黄绿
    '复古': '#D4A373',      // 淡棕
    '时尚': '#FEC5BB',      // 淡桃
    '休闲': '#FCD5CE',      // 淡桃红
    '正式': '#FFE5D9',      // 杏仁白
    
    // 特色类 - 橙色/黄色系
    '笑容治愈': '#FFD7BA',  // 杏黄
    '声音好听': '#FFE5D9',  // 杏仁白
    '演技精湛': '#FEC89A',  // 桃杏
    '舞蹈优美': '#FFB4A2',  // 浅珊瑚
    '身材完美': '#FFCDB2',  // 淡桃
    '气质出众': '#FFB7C5',  // 樱桃粉
    '眼神迷人': '#FFCCD5',  // 淡粉红
    '才华横溢': '#B5EAD7',  // 淡薄荷
    '多才多艺': '#C7CEEA',  // 淡紫蓝
    '个性鲜明': '#FFDAC1',  // 桃杏
    '气场强大': '#E2F0CB',  // 淡黄绿
    '亲和力强': '#B5EAD7',  // 淡薄荷
    '表现力强': '#FFB7C5',  // 樱桃粉
    '舞台表现': '#FFCDB2',  // 淡桃
    
    // 性格类 - 混合色系
    '开朗': '#FFD7BA',      // 杏黄
    '内向': '#B5EAD7',      // 淡薄荷
    '自信': '#C7CEEA',      // 淡紫蓝
    '谦虚': '#E2F0CB',      // 淡黄绿
    '热情': '#FFB4A2',      // 浅珊瑚
    '冷静': '#A2D2FF',      // 天蓝
    '幽默': '#FFD7BA',      // 杏黄
    '严肃': '#CDB4DB',      // 淡紫
    '浪漫': '#FFC8DD',      // 浅粉
    '务实': '#D4A373',      // 淡棕
    '乐观': '#FFD7BA',      // 杏黄
    '悲观': '#BDE0FE',      // 淡蓝
    '独立': '#C8A2C8',      // 淡紫罗兰
    '依赖': '#FFAFCC',      // 婴儿粉
    
    // 外貌特征类
    '长发': '#FFD6FF',      // 薰衣草紫
    '短发': '#A2D2FF',      // 天蓝
    '卷发': '#FFC8DD',      // 浅粉
    '直发': '#BDE0FE',      // 淡蓝
    '黑发': '#D8BFD8',      // 蓟紫
    '金发': '#FFD7BA',      // 杏黄
    '棕发': '#D4A373',      // 淡棕
    '红发': '#FFB4A2',      // 浅珊瑚
    '蓝眼': '#A2D2FF',      // 天蓝
    '绿眼': '#B5EAD7',      // 淡薄荷
    '棕眼': '#D4A373',      // 淡棕
    '高个子': '#C7CEEA',    // 淡紫蓝
    '娇小': '#FFC8DD',      // 浅粉
    '苗条': '#FFD6FF',      // 薰衣草紫
    '丰满': '#FFAFCC',      // 婴儿粉
};
// 马卡龙配色数组（用于自动分配）
const MACARON_COLORS = [
    '#FFB6C1', '#FFC8DD', '#FFAFCC', '#FF85A1', '#CDB4DB',
    '#FFD6FF', '#A2D2FF', '#BDE0FE', '#FFD7BA', '#FFE5D9',
    '#FEC89A', '#FFB4A2', '#FFCDB2', '#FFB7C5', '#FFCCD5',
    '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB', '#CCD5AE',
    '#E9EDC9', '#FEFAE0', '#FAEDCD', '#D4A373', '#FEC5BB',
    '#FCD5CE', '#FFE5D9', '#D8BFD8', '#C8A2C8', '#DDA0DD'
];

// 智能获取标签颜色（如果标签不在预定义中，自动分配）
function getTagColor(tag) {
    // 首先检查预定义颜色
    if (TAG_COLORS[tag]) {
        return TAG_COLORS[tag];
    }
    
    // 如果标签不存在，根据标签名称的哈希值自动分配颜色
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 使用哈希值选择马卡龙颜色
    const colorIndex = Math.abs(hash) % MACARON_COLORS.length;
    return MACARON_COLORS[colorIndex];
}

// 从本地存储加载角色数据
let characters = loadCharacters();

// 确保所有角色都有 works 数组
characters.forEach(char => {
    if (!char.works) {
        char.works = [];
    }
});

// 从备份文件恢复数据
function restoreFromBackupFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // 检查备份数据格式
                let charactersData = backupData;
                if (backupData.characters) {
                    charactersData = backupData.characters;
                }
                
                if (!Array.isArray(charactersData)) {
                    throw new Error('备份文件格式不正确');
                }
                
                if (confirm(`是否要从备份文件恢复 ${charactersData.length} 个角色？这将会覆盖当前所有数据。`)) {
                    characters = charactersData;
                    
                    // 确保所有角色都有必要的字段
                    characters.forEach(char => {
                        if (!char.works) char.works = [];
                        if (!char.id) char.id = Date.now() + Math.random();
                        if (!char.createdAt) char.createdAt = new Date().toISOString();
                        if (!char.updatedAt) char.updatedAt = new Date().toISOString();
                    });
                    
                    recalculateAllRanks();
                    updateGlobalRanking();
                    
                    if (saveCharacters()) {
                        updateStatistics();
                        renderCharacterList();
                        showMessage(`成功从备份文件恢复 ${charactersData.length} 个角色`, 'success');
                    }
                }
            } catch (error) {
                console.error('恢复失败:', error);
                showMessage('恢复失败：备份文件格式不正确', 'info');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// 批量管理变量
let batchMode = false;
let selectedCharacterIds = new Set();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeScoreControls();
    initializeTagSystem();
    updateStatistics();
    updateGlobalRanking();  // 初始化排名
    renderCharacterList();
    
    document.getElementById('char-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveCharacter();
        }
    });
});

// =============== 数据管理 ===============

function loadCharacters() {
    const saved = localStorage.getItem('characterCollection');
    let chars = [];
    
    if (saved) {
        try {
            chars = JSON.parse(saved);
        } catch (e) {
            console.error('加载数据失败:', e);
            return [];
        }
    }
    
    // 加载作品数据
    const worksData = localStorage.getItem('characterWorks');
    if (worksData) {
        try {
            const worksMap = JSON.parse(worksData);
            chars.forEach(char => {
                if (worksMap[char.id]) {
                    char.works = worksMap[char.id];
                } else {
                    char.works = [];
                }
            });
        } catch (e) {
            console.error('加载作品数据失败:', e);
            chars.forEach(char => char.works = []);
        }
    } else {
        chars.forEach(char => char.works = []);
    }
    
    return chars;
}

function saveCharacters() {
    try {
        localStorage.setItem('characterCollection', JSON.stringify(characters));
        // 同时保存作品数据
        saveCharacterWorks();
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        alert('保存数据失败，可能是存储空间不足');
        return false;
    }
}

// =============== 统计功能 ===============

function updateStatistics() {
    const totalCount = characters.length;
    const urCount = characters.filter(c => c.rank === 'UR').length;
    
    let avgScore = 0;
    if (totalCount > 0) {
        const totalScore = characters.reduce((sum, char) => sum + char.totalScore, 0);
        avgScore = totalScore / totalCount;
    }
    
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('ur-count').textContent = urCount;
    document.getElementById('avg-score').textContent = avgScore.toFixed(1);
}

// =============== 评分系统 ===============

// =============== 初始化评分控件（删除了右边的无效箭头） ===============
function initializeScoreControls() {
    const container = document.getElementById('score-container');
    if (!container) return;
    
    container.className = 'score-input-container';
    container.innerHTML = '';
    
    ATTRIBUTES.forEach(attr => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-input-item';
        scoreItem.innerHTML = `
            <div class="score-input-header">
                <span class="attribute-name">${attr.name}</span>
                <span class="weight-tag ${attr.group}">${attr.weight}x</span>
            </div>
            <div class="score-input-control">
                <input type="number" 
                       class="score-number-input" 
                       min="1" 
                       max="100" 
                       step="1"
                       value="70"
                       data-attribute="${attr.name}"
                       oninput="validateScoreInput(this)">
                <span style="color: #666; font-size: 0.85rem;">分</span>
                <!-- ✅ 已删除右边的无效箭头按钮组 -->
            </div>
            <div class="score-range-hint">常用分值: 60-100</div>
            <div class="score-quick-buttons">
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 60); event.stopPropagation(); event.preventDefault(); return false;">60</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 70); event.stopPropagation(); event.preventDefault(); return false;">70</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 75); event.stopPropagation(); event.preventDefault(); return false;">75</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 80); event.stopPropagation(); event.preventDefault(); return false;">80</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 85); event.stopPropagation(); event.preventDefault(); return false;">85</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 90); event.stopPropagation(); event.preventDefault(); return false;">90</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 95); event.stopPropagation(); event.preventDefault(); return false;">95</button>
                <button type="button" class="score-quick-btn" onclick="setQuickScore('${attr.name}', 100); event.stopPropagation(); event.preventDefault(); return false;">100</button>
            </div>
        `;
        container.appendChild(scoreItem);
    });
}
function setQuickScore(attribute, score) {
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const input = document.querySelector(`.score-number-input[data-attribute="${attribute}"]`);
    if (input) {
        input.value = score;
        validateScoreInput(input);
        
        // 触发change事件
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
    }
    return false;
}

function validateScoreInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 1 || value > 100) {
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
    }
}
function updateScoreFromInput(input) {
    // 这个函数用于处理输入框change事件
    validateScoreInput(input);
}

// =============== 编辑角色（修复版：不会退回） ===============
function editCharacter(index) {
    // ✅ 关键修复：彻底阻止所有事件传播
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const character = characters[index];
    if (!character) return;
    
    window.editingIndex = index;
    
    // 先关闭详情页（如果开着）
    const detailModal = document.getElementById('character-detail-modal');
    if (detailModal && detailModal.style.display === 'block') {
        hideCharacterDetail();
    }
    
    // 填充基本信息
    document.getElementById('char-name').value = character.name || '';
    document.getElementById('char-age').value = character.age || '';
    
    // 填充标签
    if (window.selectedTags) {
        window.selectedTags.clear();
        if (character.tags && Array.isArray(character.tags)) {
            character.tags.forEach(tag => {
                if (tag) window.selectedTags.add(tag);
            });
        }
        renderTagInput();
    }
    
    // 填充评分
    setTimeout(() => {
        ATTRIBUTES.forEach(attr => {
            const input = document.querySelector(`.score-number-input[data-attribute="${attr.name}"]`);
            if (input) {
                const score = character.scores && character.scores[attr.name] ? character.scores[attr.name] : 70;
                input.value = score;
                validateScoreInput(input);
            }
        });
    }, 100);
    
    // 修改按钮文字和事件
    const saveButton = document.querySelector('.btn-success');
    if (saveButton) {
        saveButton.innerHTML = '<i class="fas fa-save"></i> 更新角色';
        // ✅ 关键修复：移除所有旧事件，确保不会触发多次
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        newSaveButton.onclick = function(e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            updateExistingCharacter(index);
        };
    }
    
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> 编辑角色';
    }
    
    // 显示表单
    document.getElementById('form-modal').style.display = 'block';
}
function getCurrentScores() {
    const scores = {};
    ATTRIBUTES.forEach(attr => {
        const input = document.querySelector(`.score-number-input[data-attribute="${attr.name}"]`);
        if (input) {
            const value = parseFloat(input.value);
            scores[attr.name] = isNaN(value) ? 70 : value; // 默认70分
        } else {
            scores[attr.name] = 70; // 默认70分
        }
    });
    return scores;
}

function calculateScoreAndRank(scores) {
    let weightedSum = 0;
    let maxPossibleSum = 0;
    
    ATTRIBUTES.forEach(attr => {
        const score = scores[attr.name] || 50;
        weightedSum += score * attr.weight;
        maxPossibleSum += 100 * attr.weight;
    });
    
    const totalScore = (weightedSum / maxPossibleSum) * 100;
    
    const allScores = characters.map(c => c.totalScore);
    allScores.push(totalScore);
    allScores.sort((a, b) => b - a);
    
    const currentIndex = allScores.indexOf(totalScore);
    const percentile = (currentIndex / allScores.length) * 100;
    
    let rank = 'R';
    for (const [rankName, config] of Object.entries(RANK_CONFIG)) {
        if (percentile >= config.minPercentile && percentile < config.maxPercentile) {
            rank = rankName;
            break;
        }
    }
    
    return {
        totalScore: parseFloat(totalScore.toFixed(1)),
        rank: rank,
        percentile: percentile.toFixed(1)
    };
}

// =============== 角色管理 ===============

function showAddForm() {
    document.getElementById('form-modal').style.display = 'block';
    
    if (!window.editingIndex && window.editingIndex !== 0) {
        document.getElementById('char-name').value = '';
        document.getElementById('char-age').value = '';
        
        document.querySelectorAll('.score-number-input').forEach(input => {
            input.value = 50;
            input.classList.remove('invalid');
        });
        
        if (window.selectedTags) {
            window.selectedTags.clear();
            renderTagInput();
        }
        
        resetFormButtons();
    }
    
    document.getElementById('char-name').focus();
}

function hideForm() {
    document.getElementById('form-modal').style.display = 'none';
    window.editingIndex = null;
    resetFormButtons();
}

function calculateAndShow() {
    const name = document.getElementById('char-name').value.trim();
    if (!name) {
        alert('请先输入角色名称');
        document.getElementById('char-name').focus();
        return;
    }
    
    const scores = getCurrentScores();
    const result = calculateScoreAndRank(scores);
    
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
        <div style="text-align: center;">
            <h3 style="margin-bottom: 20px; color: #333;">${name} 的评分预览</h3>
            
            <div style="font-size: 4rem; margin: 20px 0; color: ${RANK_CONFIG[result.rank].color};">${result.rank}</div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>加权总分：</span>
                    <strong style="color: #667eea; font-size: 1.2rem;">${result.totalScore}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>排名百分比：</span>
                    <strong>前 ${result.percentile}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>属性数量：</span>
                    <strong>14项</strong>
                </div>
            </div>
            
            <div style="margin-top: 20px; font-size: 0.9rem; color: #666;">
                <p>提示：这只是基于当前数据的预估等级，保存后会重新计算所有角色的实际排名。</p>
            </div>
        </div>
    `;
    
    document.getElementById('preview-modal').style.display = 'block';
}

function hidePreview() {
    document.getElementById('preview-modal').style.display = 'none';
}

function saveCharacter() {
    if (window.editingIndex !== null && window.editingIndex !== undefined) {
        updateExistingCharacter(window.editingIndex);
        return;
    }
    
    const name = document.getElementById('char-name').value.trim();
    const age = document.getElementById('char-age').value.trim();
    
    if (!name) {
        alert('请输入角色名称');
        document.getElementById('char-name').focus();
        return;
    }
    
    const scores = getCurrentScores();
    const result = calculateScoreAndRank(scores);
    
    const character = {
        id: Date.now(),
        name: name,
        age: age ? parseInt(age) : null,
        tags: getSelectedTags(), 
        scores: scores,
        totalScore: result.totalScore,
        rank: result.rank,
        percentile: result.percentile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    characters.push(character);
    
    recalculateAllRanks();
    updateGlobalRanking();
    
    if (saveCharacters()) {
        updateStatistics();
        renderCharacterList();
        hideForm();
        showMessage(`角色 "${name}" 已保存！等级：${character.rank}`, 'success');
    }
}

function recalculateAllRanks() {
    if (characters.length === 0) return;
    
    const sortedCharacters = [...characters].sort((a, b) => b.totalScore - a.totalScore);
    
    sortedCharacters.forEach((char, index) => {
        const percentile = (index / sortedCharacters.length) * 100;
        
        let newRank = 'R';
        for (const [rankName, config] of Object.entries(RANK_CONFIG)) {
            if (percentile >= config.minPercentile && percentile < config.maxPercentile) {
                newRank = rankName;
                break;
            }
        }
        
        char.rank = newRank;
        char.percentile = percentile.toFixed(1);
    });
    
    characters = sortedCharacters;
}

// =============== 全局排名系统 ===============

function updateGlobalRanking() {
    if (characters.length === 0) return;
    
    const rankedCharacters = [...characters].sort((a, b) => b.totalScore - a.totalScore);
    
    rankedCharacters.forEach((char, index) => {
        const originalChar = characters.find(c => c.id === char.id);
        if (originalChar) {
            originalChar.globalRank = index + 1;
        }
    });
}

// =============== 渲染角色列表（带头像+信息靠左，不碰编辑逻辑） ===============
function renderCharacterList() {
    const container = document.getElementById('character-list');
    
    if (characters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-user-plus"></i>
                </div>
                <h3>还没有任何角色</h3>
                <p>点击上方的"添加新角色"按钮开始创建你的第一个角色吧！</p>
            </div>
        `;
        return;
    }
    
    updateGlobalRanking();
    
    const rankOrder = { 'UR': 0, 'SSR': 1, 'SR': 2, 'R': 3 };
    const sortedCharacters = [...characters].sort((a, b) => {
        if (rankOrder[a.rank] !== rankOrder[b.rank]) {
            return rankOrder[a.rank] - rankOrder[b.rank];
        }
        return b.totalScore - a.totalScore;
    });
    
    container.innerHTML = sortedCharacters.map((char, index) => {
        const characterId = char.id.toString();
        const isSelected = batchMode && selectedCharacterIds.has(characterId);
        const characterIndex = characters.findIndex(c => c.id === char.id);
        const workCount = char.works && char.works.length ? char.works.length : 0;
        
        return `
        <div class="character-card ${isSelected ? 'selected' : ''}" data-id="${characterId}" onclick="handleCharacterCardClick(event, '${characterId}')">
            
            ${batchMode ? `
            <div class="checkbox-container">
                <input type="checkbox" class="batch-checkbox" 
                       ${isSelected ? 'checked' : ''}
                       onclick="event.stopPropagation()">
            </div>
            ` : ''}
            
            <div class="card-header">
                <div class="rank-badge rank-${char.rank.toLowerCase()}">${char.rank}</div>
                <div class="global-rank">#${char.globalRank || (index + 1)}</div>
                <div class="name-with-copy">
                    <button class="btn-copy-name" onclick="copyCharacterName('${char.name}', event)" title="复制角色名称">
                        <i class="fas fa-clipboard"></i>
                    </button>
                    <h3 class="character-name">${char.name}</h3>
                </div>
            </div>
            
            <!-- 角色头像 - 点击上传 -->
            <div class="character-avatar" onclick="uploadCharacterAvatar('${characterId}')">
                ${getCharacterAvatar(char) ? 
                    `<img src="${getCharacterAvatar(char)}" class="avatar-image" alt="${char.name}">` : 
                    `<div class="avatar-placeholder">
                        <i class="fas fa-camera"></i>
                        <span>上传照片</span>
                     </div>`
                }
            </div>
            
            <!-- 角色信息 - 全部左对齐 -->
            <div class="character-info">
                ${char.age ? `<div><span class="info-label">年龄:</span> <strong>${char.age}</strong></div>` : ''}
                <div><span class="info-label">总分:</span> <strong style="color: #667eea; font-size: 1.1rem;">${char.totalScore.toFixed(2)}</strong></div>
                <div><span class="info-label">等级:</span> <strong>${char.rank}</strong> (前 ${char.percentile}%)</div>
                
                <div class="work-count-display" onclick="showCharacterWorks('${characterId}')" style="cursor: pointer; margin-top: 5px;">
                    <span class="info-label"><i class="fas fa-film" style="color: #667eea;"></i> 作品:</span> 
                    <strong style="color: #667eea;">${workCount}</strong>
                    ${workCount > 0 ? '<span style="font-size: 0.8rem; color: #666; margin-left: 5px;">点击查看</span>' : ''}
                </div>
                
                ${char.tags && char.tags.length > 0 ? `
                <div class="character-tags">
                    ${char.tags.map(tag => `
                        <span class="tag-small" style="background: ${getTagColor(tag)}; color: white;">${tag}</span>
                    `).join('')}
                </div>
                ` : ''}
                
                <div class="create-time">
                    <i class="far fa-clock"></i>
                    创建: ${formatDate(char.createdAt)}
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn-small btn-edit" onclick="editCharacter(${characterIndex}); event.stopPropagation();">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn-small btn-delete" onclick="deleteCharacter(${characterIndex}); event.stopPropagation();">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // 只保留筛选
    setTimeout(() => {
        applyFilters();
        updateTagList();
    }, 50);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// =============== 角色操作 ===============



function updateExistingCharacter(index) {
    const character = characters[index];
    const name = document.getElementById('char-name').value.trim();
    const age = document.getElementById('char-age').value.trim();
    
    if (!name) {
        alert('请输入角色名称');
        document.getElementById('char-name').focus();
        return;
    }
    
    const scores = getCurrentScores();
    const tags = getSelectedTags();
    const result = calculateScoreAndRank(scores);
    
    character.name = name;
    character.age = age ? parseInt(age) : null;
    character.tags = tags;
    character.scores = scores;
    character.totalScore = result.totalScore;
    character.rank = result.rank;
    character.percentile = result.percentile;
    character.updatedAt = new Date().toISOString();
    
    recalculateAllRanks();
    updateGlobalRanking();
    
    if (saveCharacters()) {
        updateStatistics();
        renderCharacterList();
        hideForm();
        resetFormButtons();
        showMessage(`角色 "${name}" 已更新！`, 'success');
    }
}

function deleteCharacter(index) {
    if (!confirm(`确定要删除角色 "${characters[index].name}" 吗？`)) {
        return;
    }
    
    const deletedName = characters[index].name;
    characters.splice(index, 1);
    
    recalculateAllRanks();
    updateGlobalRanking();
    
    if (saveCharacters()) {
        updateStatistics();
        renderCharacterList();
        showMessage(`已删除角色: ${deletedName}`, 'success');
    }
}

function resetFormButtons() {
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> 添加新角色';
    }
    
    const saveButton = document.querySelector('.btn-success');
    if (saveButton) {
        saveButton.innerHTML = '<i class="fas fa-save"></i> 保存角色';
        saveButton.onclick = saveCharacter;
    }
    
    const previewButton = document.querySelector('.btn-info');
    if (previewButton) {
        previewButton.innerHTML = '<i class="fas fa-calculator"></i> 预览等级';
    }
    
    window.editingIndex = null;
}

// =============== 随机功能 ===============

function randomCharacter() {
    if (characters.length === 0) {
        showMessage('还没有角色，请先添加一些角色', 'info');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * characters.length);
    const character = characters[randomIndex];
    
    const modalContent = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">🎲</div>
            <h2 style="color: #333; margin-bottom: 10px;">随机抽取结果</h2>
            <h3 style="color: #667eea; font-size: 2rem; margin: 20px 0;">${character.name}</h3>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <div style="font-size: 4rem; color: ${RANK_CONFIG[character.rank].color}; margin: 10px 0;">${character.rank}</div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>总分：</span>
                    <strong style="font-size: 1.2rem;">${character.totalScore}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>排名：</span>
                    <strong>前 ${character.percentile}%</strong>
                </div>
                ${character.age ? `<div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>年龄：</span>
                    <strong>${character.age}</strong>
                </div>` : ''}
            </div>
            
            <div style="margin-top: 30px;">
                <button onclick="randomCharacter()" style="background: #667eea; color: white; border: none; padding: 12px 30px; border-radius: 50px; font-size: 1rem; cursor: pointer; margin-right: 10px;">
                    <i class="fas fa-redo"></i> 再抽一次
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.style.display='none'" style="background: #e5e7eb; color: #4b5563; border: none; padding: 12px 30px; border-radius: 50px; font-size: 1rem; cursor: pointer;">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
        </div>
    `;
    
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = modalContent;
    document.getElementById('preview-modal').style.display = 'block';
}

function showAllCharacters() {
    if (characters.length === 0) {
        showMessage('还没有添加任何角色', 'info');
        return;
    }
    
    updateGlobalRanking();
    
    const sortedCharacters = [...characters].sort((a, b) => b.totalScore - a.totalScore);
    
    let html = `
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #667eea; margin-bottom: 20px;">所有角色列表</h2>
            <p style="color: #666; margin-bottom: 20px;">共 ${characters.length} 个角色</p>
            
            <div style="max-height: 400px; overflow-y: auto; text-align: left;">
                <table style="width: 100%; border-collapse: collapse;">
    `;
    
    sortedCharacters.forEach((char, index) => {
        html += `
            <tr style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <td style="padding: 10px; width: 50px; text-align: center; font-weight: bold; color: #667eea;">
                    #${char.globalRank || (index + 1)}
                </td>
                <td style="padding: 10px;">
                    <strong>${char.name}</strong>
                    ${char.age ? `<br><span style="font-size: 0.9em; color: #666;">年龄: ${char.age}</span>` : ''}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 15px; 
                          background: ${char.rank === 'UR' ? '#ff6b6b' : char.rank === 'SSR' ? '#a29bfe' : char.rank === 'SR' ? '#74b9ff' : '#55efc4'}; 
                          color: white; font-weight: bold;">
                        ${char.rank}
                    </span>
                </td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #667eea;">
                    ${char.totalScore.toFixed(2)}
                </td>
            </tr>
        `;
    });
    
    html += `
                </table>
            </div>
            
            <div style="margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="padding: 10px 30px; background: #667eea; color: white; border: none; border-radius: 20px; cursor: pointer;">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 700px;">
            ${html}
        </div>
    `;
    
    document.body.appendChild(modal);
}

// =============== 数据导入导出 ===============

function exportData() {
    if (characters.length === 0) {
        showMessage('没有数据可以导出', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `角色收藏馆备份_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('数据已导出为JSON文件', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedData)) {
                    throw new Error('文件格式不正确');
                }
                
                const isValid = importedData.every(item => 
                    item && 
                    typeof item.name === 'string' &&
                    typeof item.totalScore === 'number'
                );
                
                if (!isValid) {
                    throw new Error('数据格式不正确');
                }
                
                if (confirm(`是否要导入 ${importedData.length} 个角色？导入会覆盖现有数据。`)) {
                    characters = importedData;
                    recalculateAllRanks();
                    updateGlobalRanking();
                    
                    if (saveCharacters()) {
                        updateStatistics();
                        renderCharacterList();
                        showMessage(`成功导入 ${importedData.length} 个角色`, 'success');
                    }
                }
            } catch (error) {
                console.error('导入失败:', error);
                showMessage('导入失败：文件格式不正确', 'info');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// =============== 消息系统 ===============

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 3000);
}

const messageStyles = document.createElement('style');
messageStyles.textContent = `
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.message-success {
    background: #10b981;
    color: white;
    border-left: 5px solid #059669;
}

.message-info {
    background: #3b82f6;
    color: white;
    border-left: 5px solid #1d4ed8;
}

.message button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    margin-left: auto;
    font-size: 1.1rem;
    opacity: 0.8;
}

.message button:hover {
    opacity: 1;
}
`;
document.head.appendChild(messageStyles);

// =============== 导入导出页面功能 ===============

// 显示导入导出页面
function showImportExportPage() {
    // 隐藏其他页面内容
    document.querySelector('.main-header').style.display = 'none';
    document.querySelector('.stats-container').style.display = 'none';
    document.querySelector('.quick-actions').style.display = 'none';
    document.querySelector('.rank-filters').style.display = 'none';
    document.querySelector('.search-filter-container').style.display = 'none';
    document.querySelector('.content-section').style.display = 'none';
    document.querySelector('.main-footer').style.display = 'none';
    
    // 显示导入导出页面
    document.getElementById('import-export-page').style.display = 'block';
    
    // 更新存储状态信息
    setTimeout(updateStorageStatus, 100);
}

// 显示角色列表页面
function showCharacterListPage() {
    // 显示其他页面内容
    document.querySelector('.main-header').style.display = 'block';
    document.querySelector('.stats-container').style.display = 'block';
    document.querySelector('.quick-actions').style.display = 'block';
    document.querySelector('.rank-filters').style.display = 'block';
    document.querySelector('.search-filter-container').style.display = 'block';
    document.querySelector('.content-section').style.display = 'block';
    document.querySelector('.main-footer').style.display = 'block';
    
    // 隐藏导入导出页面
    document.getElementById('import-export-page').style.display = 'none';
}

// 导出全部数据
function exportAllData() {
    const exportData = {
        characters: characters,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `角色收藏馆全量备份_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('全量数据已导出为JSON文件', 'success');
}

// 仅导出角色
function exportOnlyCharacters() {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `角色收藏馆角色备份_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('角色数据已导出为JSON文件', 'success');
}

// 仅导出作品
function exportOnlyWorks() {
    const worksData = characters.map(char => ({
        id: char.id,
        name: char.name,
        works: char.works || []
    })).filter(char => char.works && char.works.length > 0);
    
    if (worksData.length === 0) {
        showMessage('没有作品数据可以导出', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(worksData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `角色收藏馆作品备份_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('作品数据已导出为JSON文件', 'success');
}

// 处理导入文件拖放
function handleImportFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processImportFile(files[0]);
    }
}

// 处理导入文件选择
function processImportFile(file) {
    // 显示导入状态
    document.getElementById('import-status').style.display = 'block';
    document.getElementById('import-status-text').textContent = '正在读取文件...';
    document.getElementById('import-results').innerHTML = '';
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            document.getElementById('import-status-text').textContent = '正在解析数据...';
            
            if (file.name.toLowerCase().endsWith('.json')) {
                // 处理JSON文件
                const importData = JSON.parse(text);
                
                if (importData.characters) {
                    // 全量数据导入
                    importCharactersData(importData.characters);
                } else {
                    // 仅角色数据导入
                    importCharactersData(importData);
                }
            } else if (file.name.toLowerCase().endsWith('.csv')) {
                // 处理CSV文件
                const charactersData = parseCSVData(text);
                importCharactersData(charactersData);
            } else {
                throw new Error('不支持的文件格式');
            }
            
        } catch (error) {
            document.getElementById('import-status-text').textContent = '导入失败';
            document.getElementById('import-results').innerHTML = `<div style="color: #ef4444;">❌ 导入失败：${error.message}</div>`;
            showMessage('文件解析失败，请检查文件格式', 'info');
        }
    };
    
    reader.onerror = function() {
        document.getElementById('import-status-text').textContent = '读取失败';
        document.getElementById('import-results').innerHTML = `<div style="color: #ef4444;">❌ 读取文件失败，请检查文件是否损坏</div>`;
        showMessage('读取文件失败，请检查文件是否损坏', 'info');
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 解析CSV数据
function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const characters = [];
    
    // 跳过注释行和空行
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        
        // 解析CSV行
        const fields = parseCSVLine(line);
        if (fields.length < 17) {
            continue;
        }
        
        // 跳过表头
        if (fields[0] === '角色名称') {
            continue;
        }
        
        // 解析角色基本信息
        const name = fields[0];
        const age = fields[1] ? parseInt(fields[1]) : null;
        
        // 解析标签（使用逗号分隔）
        const tags = [];
        for (let j = 2; j < 16; j++) {
            if (fields[j] && fields[j].trim()) {
                tags.push(fields[j].trim());
            }
        }
        
        // 解析评分
        const scores = {
            '感觉': fields[16] ? parseInt(fields[16]) : 0,
            '相貌': fields[17] ? parseInt(fields[17]) : 0,
            '神态': fields[18] ? parseInt(fields[18]) : 0,
            '气质': fields[19] ? parseInt(fields[19]) : 0,
            '腿型': fields[20] ? parseInt(fields[20]) : 0,
            '演技': fields[21] ? parseInt(fields[21]) : 0,
            '投入': fields[22] ? parseInt(fields[22]) : 0,
            '皮肤状态': fields[23] ? parseInt(fields[23]) : 0,
            '腰臀比': fields[24] ? parseInt(fields[24]) : 0,
            '胸型': fields[25] ? parseInt(fields[25]) : 0,
            '体态': fields[26] ? parseInt(fields[26]) : 0,
            '笑容': fields[27] ? parseInt(fields[27]) : 0,
            '微表情': fields[28] ? parseInt(fields[28]) : 0,
            '声音': fields[29] ? parseInt(fields[29]) : 0
        };
        
        // 计算总分
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
        
        // 创建角色对象
        const character = {
            name: name,
            age: age,
            tags: tags,
            scores: scores,
            totalScore: totalScore,
            works: []
        };
        
        // 解析作品（每4个字段为一个作品）
        for (let j = 30; j < fields.length; j += 4) {
            const workTitle = fields[j];
            if (workTitle) {
                const workRating = fields[j + 1] ? parseInt(fields[j + 1]) : 0;
                const workTags = fields[j + 2] ? fields[j + 2].split(',').map(tag => tag.trim()) : [];
                const workDescription = fields[j + 3] || '';
                
                const work = {
                    title: workTitle,
                    rating: workRating,
                    tags: workTags,
                    description: workDescription
                };
                character.works.push(work);
            }
        }
        
        characters.push(character);
    }
    
    return characters;
}

// 解析CSV行（处理包含逗号的字段）
function parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    fields.push(currentField.trim());
    return fields;
}

// 导入角色数据
function importCharactersData(characterData) {
    if (!Array.isArray(characterData)) {
        document.getElementById('import-status-text').textContent = '导入失败';
        document.getElementById('import-results').innerHTML = `<div style="color: #ef4444;">❌ 导入失败：数据格式不正确</div>`;
        showMessage('数据格式不正确，请检查文件内容', 'info');
        return;
    }
    
    document.getElementById('import-status-text').textContent = `正在导入 ${characterData.length} 个角色...`;
    
    let importedCount = 0;
    let failedCount = 0;
    const results = [];
    
    characterData.forEach((data, index) => {
        try {
            // 检查必要字段
            if (!data.name) {
                failedCount++;
                results.push(`<div style="color: #ef4444;">❌ 导入失败：缺少角色名称</div>`);
                return;
            }
            
            // 检查是否已存在同名角色
            const existingIndex = characters.findIndex(c => c.name === data.name);
            
            if (existingIndex >= 0) {
                // 更新现有角色
                const character = characters[existingIndex];
                character.age = data.age;
                character.tags = data.tags || [];
                character.scores = data.scores || {};
                character.totalScore = data.totalScore || 0;
                character.rank = data.rank || 'R';
                character.percentile = data.percentile || 100;
                character.works = data.works || [];
                character.updatedAt = new Date().toISOString();
                
                results.push(`<div style="color: #f59e0b;">⚠️ 更新角色：${data.name}</div>`);
            } else {
                // 创建新角色
                const character = {
                    id: data.id || Date.now() + index,
                    name: data.name,
                    age: data.age,
                    tags: data.tags || [],
                    scores: data.scores || {},
                    totalScore: data.totalScore || 0,
                    rank: data.rank || 'R',
                    percentile: data.percentile || 100,
                    works: data.works || [],
                    createdAt: data.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                characters.push(character);
                importedCount++;
                results.push(`<div style="color: #10b981;">✅ 导入角色：${data.name}</div>`);
            }
            
        } catch (error) {
            failedCount++;
            results.push(`<div style="color: #ef4444;">❌ 导入失败：${data.name || '未知角色'} - ${error.message}</div>`);
        }
    });
    
    // 重新计算所有角色的排名
    recalculateAllRanks();
    updateGlobalRanking();
    
    // 保存数据
    if (saveCharacters()) {
        updateStatistics();
        renderCharacterList();
        
        document.getElementById('import-status-text').textContent = '导入完成';
        document.getElementById('import-results').innerHTML = results.join('');
        
        showMessage(`成功导入 ${importedCount} 个角色，更新 ${characterData.length - importedCount - failedCount} 个角色，失败 ${failedCount} 个角色`, 'success');
    }
}

// 下载导入模板 (JSON格式)
function downloadImportTemplate() {
    const template = {
        characters: [
            {
                "name": "角色名称",
                "age": 20,
                "tags": ["标签1", "标签2"],
                "works": [
                    {
                        "title": "作品名称",
                        "rating": 8,
                        "tags": ["作品标签1"],
                        "description": "作品简介"
                    }
                ]
            }
        ],
        "说明": "请按照此模板格式填写角色和作品数据，支持仅填写角色信息或同时填写角色和作品信息"
    };
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = '角色收藏馆导入模板.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('JSON导入模板已下载', 'success');
}

// 下载CSV导入模板
function downloadCSVImportTemplate() {
    // CSV格式的角色模板（包含评分字段）
    let csvContent = "角色名称,年龄,标签,感觉,相貌,神态,气质,腿型,演技,投入,皮肤状态,腰臀比,胸型,体态,笑容,微表情,声音,作品1名称,作品1评分,作品1标签,作品1简介,作品2名称,作品2评分,作品2标签,作品2简介\n";
    csvContent += "角色1,20,标签1,标签2,100,100,100,100,90,95,100,100,90,100,100,100,95,作品1,8,作品标签1,作品简介1,作品2,9,作品标签2,作品简介2\n";
    csvContent += "角色2,25,标签3,标签4,95,95,95,95,85,90,95,95,85,95,95,95,90,,0,,,\n";
    csvContent += "\n";
    csvContent += "# 说明：\n";
    csvContent += "# 1. 角色评分字段：感觉,相貌,神态,气质,腿型,演技,投入,皮肤状态,腰臀比,胸型,体态,笑容,微表情,声音\n";
    csvContent += "# 2. 评分范围：0-100\n";
    csvContent += "# 3. 标签使用逗号分隔多个标签\n";
    csvContent += "# 4. 支持多个作品：作品1名称,作品1评分,作品1标签,作品1简介,作品2名称,作品2评分,作品2标签,作品2简介\n";
    csvContent += "# 5. 作品字段为空时，表示该角色没有对应位置的作品\n";
    csvContent += "# 6. 可以根据需要添加更多作品字段，格式为：作品3名称,作品3评分,作品3标签,作品3简介\n";
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileName = '角色收藏馆导入模板.csv';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('CSV导入模板已下载', 'success');
}

// 下载仅角色模板
function downloadCharacterTemplate() {
    const template = {
        "说明": "仅角色模板 - 请按照此格式填写角色数据",
        "示例": [
            {
                "name": "角色名称",
                "age": 20,
                "tags": ["标签1", "标签2"]
            }
        ]
    };
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = '角色收藏馆仅角色模板.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('仅角色模板已下载', 'success');
}

// 下载仅作品模板
function downloadWorksTemplate() {
    const template = {
        "说明": "仅作品模板 - 请按照此格式填写作品数据，需要与角色名称对应",
        "示例": [
            {
                "characterName": "角色名称",
                "works": [
                    {
                        "title": "作品名称",
                        "rating": 8,
                        "tags": ["作品标签1"],
                        "description": "作品简介"
                    }
                ]
            }
        ]
    };
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = '角色收藏馆仅作品模板.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('仅作品模板已下载', 'success');
}

// 监听文件输入变化
document.addEventListener('DOMContentLoaded', function() {
    const importFileInput = document.getElementById('import-file');
    if (importFileInput) {
        importFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                processImportFile(e.target.files[0]);
            }
        });
    }
});

// =============== 标签系统 ===============

const TAG_CATEGORIES = {
    '风格': ['御姐', '甜美', '清纯', '性感', '帅气', '可爱', '高冷', '温柔', '活泼', '优雅'],
    '类型': ['演员', '偶像', '模特', '网红', '虚拟偶像', '歌手', '舞者', '声优'],
    '场景': ['古装', '现代', '职场', '校园', '运动', '礼服', '日常', '舞台'],
    '特色': ['笑容治愈', '声音好听', '演技精湛', '舞蹈优美', '身材完美', '气质出众', '眼神迷人']
};

let customTags = JSON.parse(localStorage.getItem('customTags')) || [];

function initializeTagSystem() {
    window.selectedTags = new Set();
    renderTagInput();
    setupTagInputEvents();
}

function renderTagInput() {
    const container = document.getElementById('tag-input');
    if (!container) return;
    
    container.innerHTML = '';
    
    Array.from(window.selectedTags).forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            ${tag}
            <button class="tag-remove" onclick="removeTag('${tag.replace(/'/g, "\\'")}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tagEl);
    });
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tag-input-field';
    input.placeholder = window.selectedTags.size === 0 ? '添加标签...' : '';
    input.oninput = showTagSuggestions;
    input.onkeydown = handleTagInputKeydown;
    input.onblur = () => setTimeout(() => {
        const suggestions = document.getElementById('tag-suggestions');
        if (suggestions) suggestions.style.display = 'none';
    }, 200);
    
    container.appendChild(input);
}

function setupTagInputEvents() {
    const tagInput = document.getElementById('tag-input');
    if (tagInput) {
        tagInput.addEventListener('click', function(e) {
            if (e.target === this) {
                const input = this.querySelector('.tag-input-field');
                if (input) input.focus();
            }
        });
    }
}

function showTagSuggestions(event) {
    const input = event.target;
    const value = input.value.trim().toLowerCase();
    const suggestions = document.getElementById('tag-suggestions');
    
    if (!value) {
        if (suggestions) suggestions.style.display = 'none';
        return;
    }
    
    const allTags = [];
    for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
        tags.forEach(tag => allTags.push({ name: tag, category, custom: false }));
    }
    customTags.forEach(tag => allTags.push({ name: tag, category: '自定义', custom: true }));
    
    const matchedTags = allTags.filter(tag => 
        tag.name.toLowerCase().includes(value) && 
        !window.selectedTags.has(tag.name)
    );
    
    if (matchedTags.length === 0) {
        if (suggestions) suggestions.style.display = 'none';
        return;
    }
    
    const grouped = {};
    matchedTags.forEach(tag => {
        if (!grouped[tag.category]) grouped[tag.category] = [];
        grouped[tag.category].push(tag);
    });
    
    let html = '';
    for (const [category, tags] of Object.entries(grouped)) {
        html += `<div class="tag-category">${category}</div>`;
        tags.forEach(tag => {
            const safeTagName = tag.name.replace(/'/g, "\\'");
            html += `
                <div class="tag-suggestion-item" onclick="addTagFromSuggestion('${safeTagName}')">
                    ${tag.name}
                    ${tag.custom ? '<span style="float:right;color:#888;font-size:0.8rem;">自定义</span>' : ''}
                </div>
            `;
        });
    }
    
    if (!allTags.some(tag => tag.name.toLowerCase() === value)) {
        const safeValue = value.replace(/'/g, "\\'");
        html += `
            <div class="tag-category">自定义标签</div>
            <div class="tag-suggestion-item" onclick="createCustomTag('${safeValue}')">
                <i class="fas fa-plus"></i> 创建新标签: "${value}"
            </div>
        `;
    }
    
    if (suggestions) {
        suggestions.innerHTML = html;
        suggestions.style.display = 'block';
        
        const rect = input.getBoundingClientRect();
        suggestions.style.top = `${rect.bottom}px`;
        suggestions.style.left = `${rect.left}px`;
        suggestions.style.width = `${rect.width}px`;
    }
}

function handleTagInputKeydown(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        
        if (value) {
            const allTags = [];
            for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
                tags.forEach(tag => allTags.push(tag));
            }
            customTags.forEach(tag => allTags.push(tag));
            
            if (allTags.some(tag => tag.toLowerCase() === value.toLowerCase())) {
                addTag(value);
            } else {
                createCustomTag(value);
            }
            input.value = '';
            const suggestions = document.getElementById('tag-suggestions');
            if (suggestions) suggestions.style.display = 'none';
        }
    } else if (event.key === 'Backspace' && !event.target.value) {
        const tags = Array.from(window.selectedTags);
        if (tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    }
}

function addTag(tag) {
    if (!window.selectedTags.has(tag)) {
        window.selectedTags.add(tag);
        renderTagInput();
    }
}

function addTagFromSuggestion(tag) {
    addTag(tag);
    const suggestions = document.getElementById('tag-suggestions');
    if (suggestions) suggestions.style.display = 'none';
    const input = document.querySelector('.tag-input-field');
    if (input) input.value = '';
}

function createCustomTag(tag) {
    if (!customTags.includes(tag)) {
        customTags.push(tag);
        localStorage.setItem('customTags', JSON.stringify(customTags));
    }
    addTag(tag);
    const suggestions = document.getElementById('tag-suggestions');
    if (suggestions) suggestions.style.display = 'none';
}

function removeTag(tag) {
    window.selectedTags.delete(tag);
    renderTagInput();
}

function getSelectedTags() {
    return Array.from(window.selectedTags);
}

// =============== 一键导入魔法 ===============

function showSimpleImport() {
    document.getElementById('simple-import-modal').style.display = 'block';
}

function hideSimpleImport() {
    document.getElementById('simple-import-modal').style.display = 'none';
    document.getElementById('import-status').style.display = 'none';
    document.getElementById('simple-csv-file').value = '';
}

function handleFileDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processSimpleCSV(files[0]);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('simple-csv-file');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                processSimpleCSV(e.target.files[0]);
            }
        });
    }
});

function processSimpleCSV(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('请选择CSV格式的文件！');
        return;
    }
    
    document.getElementById('import-status').style.display = 'block';
    document.getElementById('status-text').textContent = '正在读取文件...';
    document.getElementById('import-results').innerHTML = '';
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            document.getElementById('status-text').textContent = '正在解析数据...';
            
            const result = parseSimpleCSV(text);
            
            if (result.success) {
                importCharacters(result.data);
            } else {
                showImportError(result.error);
            }
            
        } catch (error) {
            showImportError('文件解析失败：' + error.message);
        }
    };
    
    reader.onerror = function() {
        showImportError('读取文件失败，请检查文件是否损坏');
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseSimpleCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
        return { success: false, error: '文件为空或只有标题行' };
    }
    
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t') && !firstLine.includes(',')) {
        delimiter = '\t';
    }
    
    const headers = firstLine.split(delimiter).map(h => h.trim());
    
    if (!headers.includes('姓名')) {
        return { success: false, error: '找不到"姓名"列，请检查文件格式' };
    }
    
    const requiredAttributes = [
        '相貌', '气质', '皮肤状态', '腰臀比', '胸型', 
        '腿型', '体态', '笑容', '微表情', '声音', 
        '神态', '投入', '演技', '感觉'
    ];
    
    const missingAttrs = requiredAttributes.filter(attr => !headers.includes(attr));
    if (missingAttrs.length > 0) {
        return { 
            success: false, 
            error: `缺少以下列：${missingAttrs.join(', ')}\n请确保列名完全一致` 
        };
    }
    
    const characters = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCSVLineSimple(lines[i], delimiter);
            if (values.length < headers.length) continue;
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            
            const name = row['姓名'];
            if (!name || name.trim() === '') {
                errors.push(`第${i+1}行：缺少姓名`);
                continue;
            }
            
            const scores = {};
            let hasValidScores = false;
            
            requiredAttributes.forEach(attr => {
                const value = row[attr];
                if (value) {
                    const score = parseFloat(value);
                    if (!isNaN(score) && score >= 1 && score <= 100) {
                        scores[attr] = score;
                        hasValidScores = true;
                    }
                }
            });
            
            if (!hasValidScores) {
                errors.push(`第${i+1}行"${name}"：没有有效的评分数据`);
                continue;
            }
            
            characters.push({
                name: name.trim(),
                scores: scores,
                age: row['年龄'] ? parseInt(row['年龄']) : null,
                tags: row['标签'] ? row['标签'].split(/[,，]/).map(t => t.trim()).filter(t => t) : []
            });
            
        } catch (error) {
            errors.push(`第${i+1}行：解析错误 - ${error.message}`);
        }
    }
    
    if (characters.length === 0) {
        return { 
            success: false, 
            error: `没有找到有效数据。错误：${errors.slice(0, 3).join('; ')}` 
        };
    }
    
    return {
        success: true,
        data: characters,
        total: characters.length,
        errors: errors
    };
}

function parseCSVLineSimple(line, delimiter) {
    if (!line.includes('"')) {
        return line.split(delimiter);
    }
    
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function importCharacters(characterData) {
    document.getElementById('status-text').textContent = `正在导入 ${characterData.length} 个角色...`;
    
    let importedCount = 0;
    let failedCount = 0;
    const results = [];
    
    const oldCount = characters.length;
    
    characterData.forEach((data, index) => {
        try {
            const result = calculateScoreAndRank(data.scores);
            
            const character = {
                id: Date.now() + index,
                name: data.name,
                age: data.age,
                tags: data.tags,
                scores: data.scores,
                totalScore: result.totalScore,
                rank: result.rank,
                percentile: result.percentile,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            characters.push(character);
            importedCount++;
            
            results.push(`<div style="color: #10b981;">✓ ${data.name} - ${character.rank}</div>`);
            
        } catch (error) {
            failedCount++;
            results.push(`<div style="color: #ef4444;">✗ ${data.name} - 导入失败</div>`);
        }
    });
    
    recalculateAllRanks();
    updateGlobalRanking();
    saveCharacters();
    
    updateStatistics();
    renderCharacterList();
    
    setTimeout(() => {
        document.getElementById('status-text').innerHTML = `
            <div style="color: #10b981; font-size: 1.2rem; font-weight: bold;">
                <i class="fas fa-check-circle"></i> 魔法完成！
            </div>
        `;
        
        document.getElementById('import-results').innerHTML = `
            <div style="background: #f0f9ff; border-radius: 10px; padding: 20px; margin-top: 15px;">
                <h4 style="margin-top: 0;">导入报告：</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; color: #10b981;">${importedCount}</div>
                        <div>成功导入</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; color: ${failedCount > 0 ? '#ef4444' : '#10b981'}">${failedCount}</div>
                        <div>导入失败</div>
                    </div>
                </div>
                
                ${importedCount > 0 ? `
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold; margin-bottom: 10px;">新增角色（前10个）：</div>
                    <div style="max-height: 200px; overflow-y: auto; padding: 10px; background: white; border-radius: 5px;">
                        ${results.slice(0, 10).join('')}
                        ${results.length > 10 ? `<div style="color: #666; margin-top: 10px;">... 还有 ${results.length - 10} 个角色</div>` : ''}
                    </div>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" onclick="hideSimpleImport()" style="padding: 10px 30px;">
                        <i class="fas fa-check"></i> 完成
                    </button>
                </div>
            </div>
        `;
    }, 500);
}

function showImportError(message) {
    document.getElementById('status-text').innerHTML = `
        <div style="color: #ef4444;">
            <i class="fas fa-times-circle"></i> 导入失败
        </div>
    `;
    
    document.getElementById('import-results').innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin-top: 15px;">
            <h4 style="color: #dc2626; margin-top: 0;">
                <i class="fas fa-exclamation-triangle"></i> 出错了
            </h4>
            <p>${message}</p>
            <div style="margin-top: 20px;">
                <h5>请检查：</h5>
                <ul style="margin-left: 20px;">
                    <li>文件是否是CSV格式</li>
                    <li>是否有"姓名"列</li>
                    <li>14个评分列名是否正确</li>
                    <li>评分是否在1-100之间</li>
                </ul>
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('simple-csv-file').click()" style="margin-top: 15px;">
                <i class="fas fa-redo"></i> 重新选择文件
            </button>
        </div>
    `;
}

// =============== 批量管理功能 ===============

function enterBatchMode() {
    console.log('进入批量管理模式');
    batchMode = true;
    selectedCharacterIds.clear();
    document.body.classList.add('batch-mode-active');
    
    const batchBar = document.getElementById('batch-mode');
    if (batchBar) {
        batchBar.style.display = 'block';
    }
    
    renderCharacterList();
    updateSelectedCount();
    showMessage('批量模式已开启！点击角色卡片或复选框进行选择', 'info');
}

function exitBatchMode() {
    console.log('退出批量模式');
    batchMode = false;
    selectedCharacterIds.clear();
    document.body.classList.remove('batch-mode-active');
    
    const batchBar = document.getElementById('batch-mode');
    if (batchBar) {
        batchBar.style.display = 'none';
    }
    
    renderCharacterList();
    showMessage('已退出批量模式', 'info');
}

function selectAllCharacters() {
    if (!batchMode) return;
    
    selectedCharacterIds.clear();
    characters.forEach(char => {
        selectedCharacterIds.add(char.id.toString());
    });
    
    updateAllCheckboxes();
    updateSelectedCount();
    showMessage(`已全选 ${characters.length} 个角色`, 'info');
}

function deselectAllCharacters() {
    if (!batchMode) return;
    
    selectedCharacterIds.clear();
    updateAllCheckboxes();
    updateSelectedCount();
    showMessage('已取消全选', 'info');
}

function updateAllCheckboxes() {
    document.querySelectorAll('.character-card').forEach(card => {
        const checkbox = card.querySelector('.batch-checkbox');
        const characterId = card.dataset.id;
        
        if (checkbox && characterId) {
            const isSelected = selectedCharacterIds.has(characterId);
            checkbox.checked = isSelected;
            card.classList.toggle('selected', isSelected);
        }
    });
}

function updateSelectedCount() {
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = selectedCharacterIds.size;
    }
}

function deleteSelectedCharacters() {
    if (!batchMode) return;
    
    const selectedCount = selectedCharacterIds.size;
    if (selectedCount === 0) {
        showMessage('请先选择要删除的角色', 'warning');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedCount} 个角色吗？此操作不可撤销！`)) {
        const deletedNames = [];
        
        characters = characters.filter(char => {
            const shouldDelete = selectedCharacterIds.has(char.id.toString());
            if (shouldDelete) {
                deletedNames.push(char.name);
            }
            return !shouldDelete;
        });
        
        saveCharacters();
        recalculateAllRanks();
        updateGlobalRanking();
        
        updateStatistics();
        renderCharacterList();
        
        selectedCharacterIds.clear();
        updateSelectedCount();
        
        if (deletedNames.length <= 3) {
            showMessage(`已删除：${deletedNames.join('、')}`, 'success');
        } else {
            showMessage(`已删除 ${deletedNames.length} 个角色`, 'success');
        }
        
        if (characters.length === 0) {
            exitBatchMode();
        }
    }
}

function handleCharacterCardClick(event, characterId) {
    // 阻止事件冒泡和默认行为
    event.stopPropagation();
    event.preventDefault();
    
    // 如果是批量模式，执行批量选择
    if (batchMode) {
        if (event.target.tagName === 'BUTTON' || 
            event.target.tagName === 'A' ||
            event.target.closest('button') ||
            event.target.closest('a')) {
            return;
        }
        
        if (selectedCharacterIds.has(characterId)) {
            selectedCharacterIds.delete(characterId);
        } else {
            selectedCharacterIds.add(characterId);
        }
        
        const card = event.currentTarget;
        const checkbox = card.querySelector('.batch-checkbox');
        if (checkbox) {
            checkbox.checked = selectedCharacterIds.has(characterId);
        }
        card.classList.toggle('selected', selectedCharacterIds.has(characterId));
        
        updateSelectedCount();
        return;
    }
    
    // 非批量模式，点击卡片打开详情页
    // 只有直接点击卡片本身（不是按钮）才打开详情页
    if (event.target.tagName === 'BUTTON' || 
        event.target.tagName === 'A' ||
        event.target.closest('button') ||
        event.target.closest('a') ||
        event.target.closest('.card-actions') ||
        event.target.closest('.work-count-display')) {
        return;
    }
    
    // 打开详情页
    showCharacterDetail(characterId);
}
// =============== 等级筛选功能 ===============

// =============== 等级筛选功能（修复版） ===============

function filterByRank(rank) {
    console.log('筛选等级:', rank);
    
    // 更新按钮状态
    document.querySelectorAll('.rank-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.rank-filter-btn').classList.add('active');
    
    // 获取所有角色卡片
    const allCards = document.querySelectorAll('.character-card');
    const container = document.getElementById('character-list');
    
    if (rank === 'all') {
        // 显示所有卡片
        allCards.forEach(card => {
            card.style.display = 'block';
        });
        
        // 显示空状态（如果没有角色）
        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h3>还没有任何角色</h3>
                    <p>点击上方的"添加新角色"按钮开始创建你的第一个角色吧！</p>
                </div>
            `;
        }
    } else {
        let hasMatchingCards = false;
        
        // 筛选并显示对应等级的角色
        allCards.forEach(card => {
            const rankBadge = card.querySelector('.rank-badge');
            if (rankBadge) {
                // 获取等级文本
                const cardRank = rankBadge.textContent.trim();
                
                console.log('卡片等级:', cardRank, '目标等级:', rank);
                
                if (cardRank === rank) {
                    card.style.display = 'block';
                    hasMatchingCards = true;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });
        
        console.log('找到匹配卡片:', hasMatchingCards);
        
        // 如果没有匹配的卡片，显示提示信息
        if (!hasMatchingCards) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>没有找到 ${rank} 等级的角色</h3>
                    <p>当前没有 ${rank} 等级的角色，可以添加新角色或查看其他等级</p>
                    <button onclick="filterByRank('all')" class="btn btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-layer-group"></i> 查看全部角色
                    </button>
                </div>
            `;
        }
    }
}

// 修复按钮点击事件
document.addEventListener('DOMContentLoaded', function() {
    // 重新绑定筛选按钮事件
    setTimeout(function() {
        document.querySelectorAll('.rank-filter-btn').forEach(btn => {
            const rank = btn.getAttribute('data-rank');
            btn.onclick = function(event) {
                filterByRank(rank);
                return false;
            };
        });
    }, 500);
});

// 获取标签颜色（智能分配）
function getTagColor(tag) {
    // 首先检查预定义颜色
    if (TAG_COLORS[tag]) {
        return TAG_COLORS[tag];
    }
    
    // 如果标签不存在，根据标签名称的哈希值自动分配颜色
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 使用哈希值选择马卡龙颜色
    const colorIndex = Math.abs(hash) % MACARON_COLORS.length;
    return MACARON_COLORS[colorIndex];

// =============== 评分输入框上下按钮功能 ===============

function incrementScore(button, change) {
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    // 找到对应的输入框
    const input = button.closest('.score-input-control')?.querySelector('.score-number-input');
    if (!input) return;
    
    let currentValue = parseFloat(input.value);
    if (isNaN(currentValue)) currentValue = 70;
    
    let newValue = currentValue + change;
    
    // 限制在1-100之间
    if (newValue < 1) newValue = 1;
    if (newValue > 100) newValue = 100;
    
    input.value = newValue;
    validateScoreInput(input);
    
    // 触发change事件
    const changeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(changeEvent);
    
    return false;
}

// 修改评分输入框HTML，添加上下按钮
function updateScoreInputHTML() {
    document.querySelectorAll('.score-input-control').forEach(control => {
        // 检查是否已经添加上下按钮
        if (!control.querySelector('.score-btn-group')) {
            const input = control.querySelector('.score-number-input');
            if (input) {
                // 创建按钮组
                const btnGroup = document.createElement('div');
                btnGroup.className = 'score-btn-group';
                btnGroup.style.display = 'flex';
                btnGroup.style.flexDirection = 'column';
                btnGroup.style.gap = '2px';
                
                // 上按钮
                const upBtn = document.createElement('button');
                upBtn.type = 'button';
                upBtn.className = 'score-up-btn';
                upBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                upBtn.style.cssText = 'width: 24px; height: 20px; border: 1px solid #e5e7eb; background: white; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
                
                // 下按钮
                const downBtn = document.createElement('button');
                downBtn.type = 'button';
                downBtn.className = 'score-down-btn';
                downBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                downBtn.style.cssText = 'width: 24px; height: 20px; border: 1px solid #e5e7eb; background: white; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
                
                btnGroup.appendChild(upBtn);
                btnGroup.appendChild(downBtn);
                
                // 插入到输入框后面
                control.appendChild(btnGroup);
            }
        }
    });
}

// 初始化评分输入框事件
function initializeScoreInputEvents() {
    const container = document.getElementById('score-container');
    if (container) {
        container.addEventListener('click', function(e) {
            if (e.target.classList.contains('score-up-btn') || e.target.closest('.score-up-btn')) {
                e.preventDefault();
                const input = e.target.closest('.score-input-item').querySelector('.score-number-input');
                incrementScore(input, 1);
            }
            if (e.target.classList.contains('score-down-btn') || e.target.closest('.score-down-btn')) {
                e.preventDefault();
                const input = e.target.closest('.score-input-item').querySelector('.score-number-input');
                incrementScore(input, -1);
            }
        });
    }
}

// 在评分控件初始化后添加上下按钮
setTimeout(() => {
    updateScoreInputHTML();
    initializeScoreInputEvents();
}, 100);
}
// =============== 搜索和标签筛选功能 ===============

// 当前筛选状态
let currentSearchKeyword = '';
let currentTagFilter = 'all';

// 搜索角色
function searchCharacters() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.querySelector('.search-clear');
    const keyword = searchInput.value.trim().toLowerCase();
    
    currentSearchKeyword = keyword;
    
    // 显示/清除按钮
    if (keyword.length > 0) {
        searchClear.style.display = 'block';
    } else {
        searchClear.style.display = 'none';
    }
    
    // 执行筛选
    applyFilters();
}

// 清除搜索
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.querySelector('.search-clear');
    
    searchInput.value = '';
    searchClear.style.display = 'none';
    currentSearchKeyword = '';
    
    applyFilters();
}

// 切换标签下拉菜单
function toggleTagDropdown() {
    const dropdown = document.getElementById('tag-dropdown-menu');
    const isVisible = dropdown.style.display === 'block';
    
    // 先关闭所有下拉菜单
    document.querySelectorAll('.tag-dropdown-menu').forEach(el => {
        el.style.display = 'none';
    });
    
    // 如果当前是隐藏的，则显示并更新标签列表
    if (!isVisible) {
        updateTagList(); // 更新标签列表
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

// 更新标签列表
function updateTagList() {
    const container = document.getElementById('tag-list-container');
    if (!container) return;
    
    // 收集所有不重复的标签
    const allTags = new Set();
    characters.forEach(char => {
        if (char.tags && Array.isArray(char.tags)) {
            char.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const sortedTags = Array.from(allTags).sort();
    
    if (sortedTags.length === 0) {
        container.innerHTML = '<div class="tag-dropdown-empty">暂无标签</div>';
        return;
    }
    
    // 生成标签列表HTML - 只保留色块标签，去掉重复的文字
    let html = '';
    sortedTags.forEach(tag => {
        const isActive = currentTagFilter === tag;
        const tagColor = getTagColor(tag);
        html += `
            <div class="tag-dropdown-item ${isActive ? 'active' : ''}" onclick="selectTagFilter('${tag.replace(/'/g, "\\'")}')">
                <span class="tag-item-filter" style="background: ${tagColor};">${tag}</span>
                ${isActive ? '<i class="fas fa-check" style="margin-left: auto; color: #2563eb;"></i>' : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 选择标签筛选
function selectTagFilter(tag) {
    if (tag === 'all') {
        currentTagFilter = 'all';
        document.getElementById('selected-tag-label').textContent = '所有标签';
    } else {
        currentTagFilter = tag;
        document.getElementById('selected-tag-label').textContent = tag;
    }
    
    // 更新下拉菜单中的激活状态
    document.querySelectorAll('.tag-dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 关闭下拉菜单
    document.getElementById('tag-dropdown-menu').style.display = 'none';
    
    // 应用筛选
    applyFilters();
    
    // 显示清除筛选按钮
    updateClearButtonVisibility();
}

// 清除所有筛选
function clearAllFilters() {
    // 清除搜索
    const searchInput = document.getElementById('search-input');
    const searchClear = document.querySelector('.search-clear');
    searchInput.value = '';
    searchClear.style.display = 'none';
    currentSearchKeyword = '';
    
    // 清除标签筛选
    currentTagFilter = 'all';
    document.getElementById('selected-tag-label').textContent = '所有标签';
    
    // 更新下拉菜单激活状态
    document.querySelectorAll('.tag-dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    const allTagItem = document.querySelector('.tag-dropdown-item[onclick*="all"]');
    if (allTagItem) allTagItem.classList.add('active');
    
    // 隐藏清除按钮
    document.querySelector('.clear-filters-btn').style.display = 'none';
    
    // 应用筛选（显示所有）
    applyFilters();
}

// 更新清除按钮显示状态
function updateClearButtonVisibility() {
    const clearBtn = document.querySelector('.clear-filters-btn');
    if (!clearBtn) return;
    
    if (currentSearchKeyword || currentTagFilter !== 'all') {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }
}

// 应用所有筛选条件
function applyFilters() {
    const container = document.getElementById('character-list');
    if (!container) return;
    
    // 获取所有角色卡片
    const allCards = document.querySelectorAll('.character-card');
    
    // 如果正在使用等级筛选，我们需要先隐藏不符合等级的角色
    // 获取当前激活的等级筛选按钮
    const activeRankBtn = document.querySelector('.rank-filter-btn.active');
    const currentRankFilter = activeRankBtn ? activeRankBtn.dataset.rank : 'all';
    
    let visibleCount = 0;
    
    allCards.forEach(card => {
        let showByRank = true;
        let showBySearch = true;
        let showByTag = true;
        
        // 1. 等级筛选
        if (currentRankFilter !== 'all') {
            const rankBadge = card.querySelector('.rank-badge');
            if (rankBadge) {
                const cardRank = rankBadge.textContent.trim();
                showByRank = cardRank === currentRankFilter;
            } else {
                showByRank = false;
            }
        }
        
        // 2. 搜索筛选（姓名）
        if (showByRank && currentSearchKeyword) {
            const nameElement = card.querySelector('h3');
            if (nameElement) {
                const characterName = nameElement.textContent.toLowerCase();
                showBySearch = characterName.includes(currentSearchKeyword);
            } else {
                showBySearch = false;
            }
        }
        
        // 3. 标签筛选
        if (showByRank && showBySearch && currentTagFilter !== 'all') {
            const tagsContainer = card.querySelector('.character-tags');
            if (tagsContainer) {
                const tagSpans = tagsContainer.querySelectorAll('.tag-small');
                let hasTag = false;
                tagSpans.forEach(span => {
                    if (span.textContent.trim() === currentTagFilter) {
                        hasTag = true;
                    }
                });
                showByTag = hasTag;
            } else {
                showByTag = false;
            }
        }
        
        // 最终显示判断
        const shouldShow = showByRank && showBySearch && showByTag;
        card.style.display = shouldShow ? 'block' : 'none';
        
        if (shouldShow) visibleCount++;
    });
    
    // 如果没有可见的角色，显示空状态提示
    if (visibleCount === 0 && characters.length > 0) {
        let message = '没有找到符合条件的角色';
        if (currentSearchKeyword && currentTagFilter !== 'all') {
            message = `没有找到包含"${currentSearchKeyword}"且标签为"${currentTagFilter}"的角色`;
        } else if (currentSearchKeyword) {
            message = `没有找到包含"${currentSearchKeyword}"的角色`;
        } else if (currentTagFilter !== 'all') {
            message = `没有找到标签为"${currentTagFilter}"的角色`;
        }
        
        // 检查是否已经显示了空状态
        if (!container.querySelector('.filter-empty-state')) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'filter-empty-state empty-state';
            emptyDiv.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>${message}</h3>
                <p>试试其他关键词或清除筛选条件</p>
                <button onclick="clearAllFilters()" class="btn btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-times-circle"></i> 清除筛选
                </button>
            `;
            container.appendChild(emptyDiv);
        }
    } else {
        // 移除空状态提示
        const emptyState = container.querySelector('.filter-empty-state');
        if (emptyState) emptyState.remove();
    }
    
    // 更新清除按钮显示
    updateClearButtonVisibility();
}

// 点击其他地方关闭下拉菜单
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('tag-dropdown-menu');
    const filterBtn = document.querySelector('.tag-filter-btn');
    
    if (dropdown && filterBtn) {
        if (!filterBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// 在页面加载完成后初始化筛选功能
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行，确保DOM完全加载
    setTimeout(() => {
        // 初始化标签下拉菜单
        updateTagList();
        
        // 初始化所有标签筛选项
        const allTagItem = document.querySelector('.tag-dropdown-item[onclick*="all"]');
        if (allTagItem) allTagItem.classList.add('active');
    }, 500);
});
// =============== 角色详情页功能 ===============

// 当前查看的角色ID
let currentDetailCharacterId = null;
// 雷达图实例
let radarChartInstance = null;

// =============== 显示角色详情（带头像版） ===============
function showCharacterDetail(characterId) {
    const character = characters.find(c => c.id.toString() === characterId.toString());
    if (!character) {
        showMessage('找不到该角色', 'error');
        return;
    }
    
    currentDetailCharacterId = characterId;
    
    // 填充基本信息
    document.getElementById('detail-name').textContent = character.name;
    document.getElementById('detail-age').textContent = character.age || '-';
    document.getElementById('detail-score').textContent = character.totalScore.toFixed(2);
    document.getElementById('detail-rank').textContent = character.rank;
    document.getElementById('detail-percentile').textContent = `前${character.percentile}%`;
    document.getElementById('detail-rank-number').textContent = `#${character.globalRank || '-'}`;
    
    // 等级徽章
    const rankBadge = document.getElementById('detail-rank-badge');
    rankBadge.textContent = character.rank;
    rankBadge.className = `rank-badge rank-${character.rank.toLowerCase()}`;
    
    // 头像显示
    const avatarImg = document.getElementById('detail-avatar-img');
    const avatarPlaceholder = document.getElementById('detail-avatar-placeholder');
    
    const avatarUrl = getCharacterAvatar(character);
    if (avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
    }
    
    // 标签
    const tagsContainer = document.getElementById('detail-tags');
    tagsContainer.innerHTML = '';
    if (character.tags && character.tags.length > 0) {
        character.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag-small';
            tagSpan.style.background = getTagColor(tag);
            tagSpan.style.color = 'white';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });
    } else {
        tagsContainer.innerHTML = '<span style="color: #999;">无标签</span>';
    }
    
    // 时间
    document.getElementById('detail-created-at').textContent = formatDate(character.createdAt);
    document.getElementById('detail-updated-at').textContent = formatDate(character.updatedAt);
    
    // 渲染雷达图
    renderRadarChart(character);
    
    // 渲染作品列表
    renderWorksList(characterId);
    
    // 显示模态框
    document.getElementById('character-detail-modal').style.display = 'block';
}

// 隐藏角色详情
function hideCharacterDetail() {
    document.getElementById('character-detail-modal').style.display = 'none';
    currentDetailCharacterId = null;
    
    // 销毁雷达图实例，释放内存
    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }
}

// 复制角色名称功能
function copyCharacterName(name, event) {
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    // 使用现代Clipboard API复制文本
    navigator.clipboard.writeText(name).then(function() {
        // 复制成功，显示提示
        showMessage(`已复制角色名称: ${name}`, 'success');
        
        // 添加复制成功动画效果
        const button = event.target.closest('.btn-copy-name');
        if (button) {
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#10b981';
            button.style.color = 'white';
            
            // 2秒后恢复原状
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-clipboard"></i>';
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        }
    }).catch(function(err) {
        // 复制失败，使用备用方法
        console.error('复制失败:', err);
        
        // 使用传统方法作为备选
        const textArea = document.createElement('textarea');
        textArea.value = name;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showMessage(`已复制角色名称: ${name}`, 'success');
            } else {
                showMessage('复制失败，请手动复制', 'error');
            }
        } catch (err) {
            showMessage('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    });
}

// 从详情页编辑角色
function editCharacterFromDetail() {
    if (currentDetailCharacterId) {
        hideCharacterDetail();
        // 找到角色索引
        const index = characters.findIndex(c => c.id.toString() === currentDetailCharacterId.toString());
        if (index !== -1) {
            editCharacter(index);
        }
    }
}

// 渲染雷达图（从60开始）
function renderRadarChart(character) {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 如果已有图表实例，先销毁
    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }
    
    // 准备数据
    const attributeNames = ATTRIBUTES.map(attr => attr.name);
    const attributeScores = ATTRIBUTES.map(attr => {
        // 确保分数存在，默认为70
        return character.scores && character.scores[attr.name] ? character.scores[attr.name] : 70;
    });
    
    // 创建雷达图
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: attributeNames,
            datasets: [{
                label: `${character.name} 的属性评分`,
                data: attributeScores,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: false,
                    min: 60,
                    max: 100,
                    ticks: {
                        stepSize: 10,
                        callback: function(value) {
                            return value + '分';
                        }
                    }
                }
            }
        }
    });
}

// =============== 作品管理功能 ===============

// 保存角色作品数据
function saveCharacterWorks() {
    const worksData = {};
    characters.forEach(char => {
        if (char.works && char.works.length > 0) {
            worksData[char.id] = char.works;
        } else {
            // 即使是空数组也保存，避免下次加载时丢失
            worksData[char.id] = [];
        }
    });
    localStorage.setItem('characterWorks', JSON.stringify(worksData));
}

// 加载角色作品数据
function loadCharacterWorks() {
    const worksData = localStorage.getItem('characterWorks');
    if (worksData) {
        try {
            const parsed = JSON.parse(worksData);
            characters.forEach(char => {
                if (parsed[char.id]) {
                    char.works = parsed[char.id];
                } else {
                    char.works = [];
                }
            });
        } catch (e) {
            console.error('加载作品数据失败:', e);
        }
    } else {
        // 初始化作品数组
        characters.forEach(char => {
            char.works = [];
        });
    }
}

// 在页面加载时调用
document.addEventListener('DOMContentLoaded', function() {
    // ... 原有的代码 ...
  
});

// 显示添加作品表单
function showAddWorkForm() {
    if (!currentDetailCharacterId) {
        showMessage('请先选择角色', 'error');
        return;
    }
    document.getElementById('add-work-modal').style.display = 'block';
    
    // 清空表单
    document.getElementById('work-title').value = '';
    document.getElementById('work-seed').value = '';
    document.getElementById('work-description').value = '';
    
    // 清空星星评分
    const starInputs = document.querySelectorAll('input[name="work-rating"]');
    starInputs.forEach(input => input.checked = false);
    document.getElementById('selected-rating-text').textContent = '未评分';
    
    // 清空作品标签
    if (window.workSelectedTags) {
        window.workSelectedTags.clear();
    } else {
        window.workSelectedTags = new Set();
    }
    renderWorkTagInput();
}

// 渲染作品标签输入框
function renderWorkTagInput() {
    const container = document.getElementById('work-tag-input');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 显示已选标签
    if (window.workSelectedTags) {
        Array.from(window.workSelectedTags).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-item';
            tagEl.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="removeWorkTag('${tag.replace(/'/g, "\\'")}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tagEl);
        });
    }
    
    // 添加输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'work-tag-input-field';
    input.placeholder = !window.workSelectedTags || window.workSelectedTags.size === 0 ? '添加标签...' : '';
    input.onkeydown = handleWorkTagKeydown;
    input.onblur = () => setTimeout(() => {
        const suggestions = document.getElementById('work-tag-suggestions');
        if (suggestions) suggestions.style.display = 'none';
    }, 200);
    
    container.appendChild(input);
}

// 处理作品标签键盘事件
function handleWorkTagKeydown(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        
        if (value) {
            addWorkTag(value);
            input.value = '';
        }
    } else if (event.key === 'Backspace' && !event.target.value) {
        // 删除最后一个标签
        if (window.workSelectedTags && window.workSelectedTags.size > 0) {
            const tags = Array.from(window.workSelectedTags);
            removeWorkTag(tags[tags.length - 1]);
        }
    }
}

// 添加作品标签
function addWorkTag(tag) {
    if (!window.workSelectedTags) {
        window.workSelectedTags = new Set();
    }
    if (!window.workSelectedTags.has(tag)) {
        window.workSelectedTags.add(tag);
        renderWorkTagInput();
    }
}

// 移除作品标签
function removeWorkTag(tag) {
    if (window.workSelectedTags) {
        window.workSelectedTags.delete(tag);
        renderWorkTagInput();
    }
}

// 获取作品选中的标签
function getWorkSelectedTags() {
    return window.workSelectedTags ? Array.from(window.workSelectedTags) : [];
}

// 保存作品
function saveWork() {
    if (!currentDetailCharacterId) {
        showMessage('请先选择角色', 'error');
        return;
    }
    
    const title = document.getElementById('work-title').value.trim();
    if (!title) {
        alert('请输入作品名称');
        document.getElementById('work-title').focus();
        return;
    }
    
    // 获取星星评分
    let rating = 0;
    const starInputs = document.querySelectorAll('input[name="work-rating"]');
    for (let input of starInputs) {
        if (input.checked) {
            rating = parseInt(input.value);
            break;
        }
    }
    
    const character = characters.find(c => c.id.toString() === currentDetailCharacterId.toString());
    if (!character) {
        showMessage('找不到该角色', 'error');
        return;
    }
    
    // 初始化作品数组
    if (!character.works) {
        character.works = [];
    }
    
    // 创建作品对象
    const work = {
        id: Date.now(),
        title: title,
        seed: document.getElementById('work-seed').value.trim() || '',
        rating: rating,
        tags: getWorkSelectedTags(),
        description: document.getElementById('work-description').value.trim() || '',
        createdAt: new Date().toISOString()
    };
    
    // 添加到作品列表
    character.works.push(work);
    
    // 保存到本地存储
    saveCharacterWorks();
    
    // 重新渲染作品列表
    renderWorksList(currentDetailCharacterId);
    
    // 更新角色卡片上的作品数量
    renderCharacterList();
    
    // 隐藏表单 - 使用hideAddWorkForm()而不是直接操作style
    hideAddWorkForm();
    
    showMessage(`已添加作品: ${title}`, 'success');
}
    
    // 隐藏添加作品表单
function hideAddWorkForm() {
    document.getElementById('add-work-modal').style.display = 'none';
    // 清空表单，避免下次打开还有旧数据
    document.getElementById('work-title').value = '';
    document.getElementById('work-seed').value = '';
    document.getElementById('work-description').value = '';
    
    // 清空星星评分
    const starInputs = document.querySelectorAll('input[name="work-rating"]');
    starInputs.forEach(input => input.checked = false);
    document.getElementById('selected-rating-text').textContent = '未评分';
    
    // 清空作品标签
    if (window.workSelectedTags) {
        window.workSelectedTags.clear();
        renderWorkTagInput();
    }
}

// 删除作品
function deleteWork(workId) {
    if (!currentDetailCharacterId) return;
    
    if (!confirm('确定要删除这个作品吗？')) {
        return;
    }
    
    const character = characters.find(c => c.id.toString() === currentDetailCharacterId.toString());
    if (!character || !character.works) return;
    
    const workIndex = character.works.findIndex(w => w.id === workId);
    if (workIndex !== -1) {
        const workTitle = character.works[workIndex].title;
        character.works.splice(workIndex, 1);
        
        // 保存到本地存储
        saveCharacterWorks();
        
        // 重新渲染
        renderWorksList(currentDetailCharacterId);
        
        // 更新角色卡片上的作品数量
        renderCharacterList();
        
        showMessage(`已删除作品: ${workTitle}`, 'success');
    }
}


// 渲染作品列表（点击打开详情页）
function renderWorksList(characterId) {
    const container = document.getElementById('works-list');
    const character = characters.find(c => c.id.toString() === characterId.toString());
    
    if (!character || !character.works || character.works.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; padding: 40px 20px;">
                <div class="empty-icon">
                    <i class="fas fa-film"></i>
                </div>
                <h4>暂无作品</h4>
                <p>点击"添加作品"按钮添加代表作品</p>
            </div>
        `;
        return;
    }
    
    // 按星级从高到低排序
    const sortedWorks = [...character.works].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
    });
    
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    
    container.innerHTML = sortedWorks.map(work => {
        // 生成星星显示
        let starsHtml = '';
        if (work.rating) {
            for (let i = 0; i < work.rating; i++) {
                starsHtml += '★';
            }
        }
        
        return `
        <div onclick="showWorkDetail('${character.id}', ${work.id})" style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 12px 20px; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s;">
            <!-- 左侧：作品名称和星级 -->
            <div style="display: flex; align-items: center; gap: 20px; flex: 1;">
                <span style="font-size: 1.1rem; font-weight: 600; color: #2d3748;">${work.title}</span>
                ${work.rating ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #ffd700; font-size: 1rem; letter-spacing: 2px;">${starsHtml}</span>
                    <span style="color: #666; font-size: 0.8rem; background: #f3f4f6; padding: 2px 8px; border-radius: 12px;">${work.rating}/10</span>
                </div>
                ` : ''}
            </div>
            
            <!-- 中间：标签 -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1;">
                ${work.tags && work.tags.length > 0 ? 
                    work.tags.map(tag => {
                        const tagColor = getTagColor(tag);
                        return `<span style="background: ${tagColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; white-space: nowrap;">${tag}</span>`;
                    }).join('')
                : '<span style="color: #999; font-size: 0.85rem;">无标签</span>'}
            </div>
            
            <!-- 右侧：删除按钮 -->
            <button onclick="event.stopPropagation(); deleteWork(${work.id})" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 5px 10px; border-radius: 4px;" title="删除作品">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        `;
    }).join('');
}

// 切换作品种子显示/隐藏
function toggleWorkSeed(workId) {
    const seedContent = document.getElementById(`work-seed-${workId}`);
    const icon = document.getElementById(`icon-${workId}`);
    
    if (seedContent) {
        if (seedContent.style.display === 'none') {
            seedContent.style.display = 'block';
            if (icon) {
                icon.className = 'fas fa-chevron-up';
            }
        } else {
            seedContent.style.display = 'none';
            if (icon) {
                icon.className = 'fas fa-chevron-down';
            }
        }
    }
}

// =============== 修改角色卡片点击事件 ===============

// 替换原来的角色卡片点击处理函数

// =============== 星星评分交互 ===============

// 监听星星点击，显示当前评分
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行，确保DOM加载完成
    setTimeout(() => {
        const starInputs = document.querySelectorAll('input[name="work-rating"]');
        starInputs.forEach(input => {
            input.addEventListener('change', function() {
                const ratingText = document.getElementById('selected-rating-text');
                if (ratingText) {
                    ratingText.textContent = `${this.value}星`;
                }
            });
        });
    }, 500);
});
// =============== 作品详情页功能 ===============

// 当前查看的作品信息
let currentWorkCharacterId = null;
let currentWorkId = null;

// 显示作品详情
function showWorkDetail(characterId, workId) {
    const character = characters.find(c => c.id.toString() === characterId.toString());
    if (!character || !character.works) return;
    
    const work = character.works.find(w => w.id === workId);
    if (!work) return;
    
    // 保存当前查看的作品信息
    currentWorkCharacterId = characterId;
    currentWorkId = workId;
    
    // 填充作品信息
    document.getElementById('work-detail-title').textContent = work.title;
    document.getElementById('work-detail-title-input').value = work.title || '';
    document.getElementById('work-detail-seed').value = work.seed || '';
    document.getElementById('work-detail-description').value = work.description || '';
    document.getElementById('work-detail-created').value = formatDate(work.createdAt) || '';
    document.getElementById('work-detail-id').value = work.id;
    
    // 填充星星评分
    const starInputs = document.querySelectorAll('input[name="work-detail-rating"]');
    starInputs.forEach(input => input.checked = false);
    if (work.rating) {
        const starToCheck = document.getElementById(`work-detail-star${work.rating}`);
        if (starToCheck) {
            starToCheck.checked = true;
            document.getElementById('work-detail-rating-text').textContent = `${work.rating}星`;
        }
    } else {
        document.getElementById('work-detail-rating-text').textContent = '未评分';
    }
    
    // 填充标签
    if (window.workDetailSelectedTags) {
        window.workDetailSelectedTags.clear();
    } else {
        window.workDetailSelectedTags = new Set();
    }
    
    if (work.tags && work.tags.length > 0) {
        work.tags.forEach(tag => window.workDetailSelectedTags.add(tag));
    }
    renderWorkDetailTagInput();
    
    // 显示模态框
    document.getElementById('work-detail-modal').style.display = 'block';
}

// 隐藏作品详情
function hideWorkDetail() {
    document.getElementById('work-detail-modal').style.display = 'none';
    currentWorkCharacterId = null;
    currentWorkId = null;
}

// 更新作品
function updateWork() {
    if (!currentWorkCharacterId || !currentWorkId) {
        showMessage('作品信息不存在', 'error');
        return;
    }
    
    const character = characters.find(c => c.id.toString() === currentWorkCharacterId.toString());
    if (!character || !character.works) return;
    
    const work = character.works.find(w => w.id === currentWorkId);
    if (!work) return;
    
    // 获取表单数据
    const title = document.getElementById('work-detail-title-input').value.trim();
    if (!title) {
        alert('请输入作品名称');
        return;
    }
    
    // 获取星星评分
    let rating = 0;
    const starInputs = document.querySelectorAll('input[name="work-detail-rating"]');
    for (let input of starInputs) {
        if (input.checked) {
            rating = parseInt(input.value);
            break;
        }
    }
    
    // 更新作品信息
    work.title = title;
    work.seed = document.getElementById('work-detail-seed').value.trim() || '';
    work.rating = rating;
    work.tags = getWorkDetailSelectedTags();
    work.description = document.getElementById('work-detail-description').value.trim() || '';
    work.updatedAt = new Date().toISOString();
    
    // 保存到本地存储
    saveCharacterWorks();
    
    // 重新渲染作品列表
    renderWorksList(currentWorkCharacterId);
    
    // 更新角色卡片上的作品数量
    renderCharacterList();
    
    // 隐藏详情页
    hideWorkDetail();
    
    showMessage(`作品《${title}》已更新`, 'success');
}

// =============== 作品详情标签功能 ===============

// 渲染作品详情标签输入框
function renderWorkDetailTagInput() {
    const container = document.getElementById('work-detail-tag-input');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 显示已选标签
    if (window.workDetailSelectedTags) {
        Array.from(window.workDetailSelectedTags).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag-item';
            tagEl.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="removeWorkDetailTag('${tag.replace(/'/g, "\\'")}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tagEl);
        });
    }
    
    // 添加输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'work-detail-tag-input-field';
    input.placeholder = !window.workDetailSelectedTags || window.workDetailSelectedTags.size === 0 ? '添加标签...' : '';
    input.onkeydown = handleWorkDetailTagKeydown;
    input.onblur = () => setTimeout(() => {
        const suggestions = document.getElementById('work-detail-tag-suggestions');
        if (suggestions) suggestions.style.display = 'none';
    }, 200);
    
    container.appendChild(input);
}

// 处理作品详情标签键盘事件
function handleWorkDetailTagKeydown(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        
        if (value) {
            addWorkDetailTag(value);
            input.value = '';
        }
    } else if (event.key === 'Backspace' && !event.target.value) {
        if (window.workDetailSelectedTags && window.workDetailSelectedTags.size > 0) {
            const tags = Array.from(window.workDetailSelectedTags);
            removeWorkDetailTag(tags[tags.length - 1]);
        }
    }
}

// 添加作品详情标签
function addWorkDetailTag(tag) {
    if (!window.workDetailSelectedTags) {
        window.workDetailSelectedTags = new Set();
    }
    if (!window.workDetailSelectedTags.has(tag)) {
        window.workDetailSelectedTags.add(tag);
        renderWorkDetailTagInput();
    }
}

// 移除作品详情标签
function removeWorkDetailTag(tag) {
    if (window.workDetailSelectedTags) {
        window.workDetailSelectedTags.delete(tag);
        renderWorkDetailTagInput();
    }
}

// 获取作品详情选中的标签
function getWorkDetailSelectedTags() {
    return window.workDetailSelectedTags ? Array.from(window.workDetailSelectedTags) : [];
}

// 初始化星星评分监听
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const starInputs = document.querySelectorAll('input[name="work-detail-rating"]');
        starInputs.forEach(input => {
            input.addEventListener('change', function() {
                const ratingText = document.getElementById('work-detail-rating-text');
                if (ratingText) {
                    ratingText.textContent = `${this.value}星`;
                }
            });
        });
    }, 500);
});
// =============== 随机抽取作品 ===============

// 随机抽取作品
function randomWork() {
    // 收集所有有作品的角色和他们的作品
    const allWorks = [];
    const workMap = []; // 存储每个作品对应的角色信息
    
    characters.forEach(character => {
        if (character.works && character.works.length > 0) {
            character.works.forEach(work => {
                allWorks.push(work);
                workMap.push({
                    characterId: character.id,
                    characterName: character.name,
                    characterRank: character.rank,
                    work: work
                });
            });
        }
    });
    
    // 检查是否有作品
    if (allWorks.length === 0) {
        showMessage('还没有任何作品，请先添加作品', 'info');
        return;
    }
    
    // 随机抽取一个作品
    const randomIndex = Math.floor(Math.random() * allWorks.length);
    const selected = workMap[randomIndex];
    const work = selected.work;
    
    // 生成星星显示
    let starsHtml = '';
    if (work.rating) {
        for (let i = 0; i < work.rating; i++) {
            starsHtml += '★';
        }
    }
    
    // 生成标签HTML
    let tagsHtml = '';
    if (work.tags && work.tags.length > 0) {
        tagsHtml = work.tags.map(tag => {
            const tagColor = getTagColor(tag);
            return `<span style="background: ${tagColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; margin: 0 4px;">${tag}</span>`;
        }).join('');
    } else {
        tagsHtml = '<span style="color: #999;">无标签</span>';
    }
    
    // 创建弹窗显示结果
    const modalContent = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">🎲</div>
            <h2 style="color: #333; margin-bottom: 10px;">随机抽取作品</h2>
            
            <!-- 作品信息卡片 -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin: 20px 0; text-align: left;">
                
                <!-- 作品名称和角色 -->
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #667eea; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                        <i class="fas fa-film"></i>
                    </div>
                    <div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: #2d3748;">${work.title}</div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <span style="color: #666;">饰演角色:</span>
                            <span style="font-size: 1.1rem; font-weight: 600; color: #667eea;">${selected.characterName}</span>
                            <span class="rank-badge rank-${selected.characterRank.toLowerCase()}" style="position: static; padding: 4px 12px;">${selected.characterRank}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 评分 -->
                ${work.rating ? `
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px;">
                    <div style="background: #ffd700; color: #8B6508; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fas fa-star"></i>
                    </div>
                    <div>
                        <div style="color: #ffd700; font-size: 1.5rem; letter-spacing: 4px;">${starsHtml}</div>
                        <div style="color: #666; font-size: 0.9rem;">评分: ${work.rating}/10</div>
                    </div>
                </div>
                ` : ''}
                
                <!-- 标签 -->
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px;">
                    <div style="background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
                
                <!-- 种子（如果有） -->
                ${work.seed ? `
                <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #667eea;">
                        <i class="fas fa-seedling"></i>
                        <span style="font-weight: 600;">种子信息</span>
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-left: 3px solid #667eea; border-radius: 6px; font-size: 0.95rem; color: #4b5563; white-space: pre-wrap; word-break: break-word;">
                        ${work.seed}
                    </div>
                </div>
                ` : ''}
                
                <!-- 简介（如果有） -->
                ${work.description ? `
                <div style="background: white; padding: 15px; border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; color: #667eea;">
                        <i class="fas fa-align-left"></i>
                        <span style="font-weight: 600;">简介</span>
                    </div>
                    <p style="margin: 0; font-size: 0.95rem; color: #4b5563; line-height: 1.6;">
                        ${work.description}
                    </p>
                </div>
                ` : ''}
                
                <!-- 添加时间 -->
                <div style="margin-top: 15px; text-align: right; color: #999; font-size: 0.8rem;">
                    <i class="far fa-clock"></i> 添加于: ${formatDate(work.createdAt)}
                </div>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button onclick="randomWork()" class="btn btn-primary" style="min-width: 140px;">
                    <i class="fas fa-redo"></i> 再抽一次
                </button>
                <button onclick="this.closest('.modal').remove()" class="btn btn-secondary" style="min-width: 140px;">
                    <i class="fas fa-times"></i> 关闭
                </button>
            </div>
        </div>
    `;
    
    // 显示弹窗
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = modalContent;
    document.getElementById('preview-modal').style.display = 'block';
}
// =============== 下拉菜单控制（点击版） ===============

// 切换下拉菜单显示/隐藏
function toggleDropdown(dropdownId) {
    // 获取当前下拉菜单
    const menuId = 'menu-' + dropdownId.replace('dropdown-', '');
    const menu = document.getElementById(menuId);
    const icon = document.getElementById('icon-' + dropdownId.replace('dropdown-', ''));
    
    // 先关闭所有其他下拉菜单
    closeAllDropdownsExcept(menuId);
    
    // 切换当前菜单
    if (menu) {
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
            if (icon) icon.className = 'fas fa-chevron-down';
        } else {
            menu.style.display = 'block';
            if (icon) icon.className = 'fas fa-chevron-up';
        }
    }
}

// 关闭所有下拉菜单
function closeAllDropdowns() {
    const menus = document.querySelectorAll('.dropdown-menu');
    menus.forEach(menu => {
        menu.style.display = 'none';
    });
    
    // 所有图标恢复向下箭头
    const icons = document.querySelectorAll('[id^="icon-"]');
    icons.forEach(icon => {
        icon.className = 'fas fa-chevron-down';
    });
}

// 关闭除了指定菜单外的所有下拉菜单
function closeAllDropdownsExcept(exceptMenuId) {
    const menus = document.querySelectorAll('.dropdown-menu');
    menus.forEach(menu => {
        if (menu.id !== exceptMenuId) {
            menu.style.display = 'none';
        }
    });
    
    // 除了当前菜单对应的图标，其他都恢复向下箭头
    const currentIconId = 'icon-' + exceptMenuId.replace('menu-', '');
    const icons = document.querySelectorAll('[id^="icon-"]');
    icons.forEach(icon => {
        if (icon.id !== currentIconId) {
            icon.className = 'fas fa-chevron-down';
        }
    });
}

// 点击页面其他地方关闭下拉菜单
document.addEventListener('click', function(event) {
    // 检查点击的元素是否在任何一个下拉菜单或按钮内
    let isClickInside = false;
    
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        if (dropdown.contains(event.target)) {
            isClickInside = true;
        }
    });
    
    if (!isClickInside) {
        closeAllDropdowns();
    }
});

// 初始化下拉菜单状态
document.addEventListener('DOMContentLoaded', function() {
    // 确保所有下拉菜单初始都是隐藏的
    closeAllDropdowns();
});
// =============== 全部作品页面功能 ===============

// 作品批量管理变量
let worksBatchMode = false;
let selectedWorkIds = new Set();

// =============== 全部作品页面功能（✅ 完全重写版 - 保证能用） ===============

// 全局变量
window.allWorksData = [];
window.filteredWorksData = [];
window.worksBatchMode = false;
window.selectedWorkIds = new Set();
window.currentWorkTagFilter = 'all';

// =============== 显示全部作品 ===============
function showAllWorks() {
  // 关闭所有下拉菜单
  if (typeof closeAllDropdowns === 'function') {
    closeAllDropdowns();
  }

  // 重新收集所有作品
  collectAllWorksData();

  // 初始化选中标签集合
  window.selectedWorkTags = new Set();
  window.currentWorkTagFilter = 'all';

  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.id = 'all-works-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-content" style="max-width: 1200px; width: 95%;">
      <div class="modal-header">
        <h2><i class="fas fa-film"></i> 全部作品库 <span style="font-size: 0.9rem; margin-left: 10px; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 30px;">共 <span id="total-works-count">${window.allWorksData.length}</span> 个作品</span></h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 25px;">
        <!-- 标签筛选区 -->
        ${renderTagFilterHTML()}
        
        <!-- 批量操作区 -->
        ${renderBatchControlsHTML()}
        
        <!-- 作品列表网格 -->
        <div id="works-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
          ${renderWorksGrid(window.filteredWorksData)}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-cancel" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i> 关闭
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// =============== 收集所有作品数据 ===============
function collectAllWorksData() {
  window.currentSearchKeyword = '';
  window.allWorksData = [];
  characters.forEach(character => {
    if (character.works && character.works.length > 0) {
      character.works.forEach(work => {
        window.allWorksData.push({
          ...work,
          characterId: character.id,
          characterName: character.name,
          characterRank: character.rank
        });
      });
    }
  });
  // 按时间倒序排序
  window.allWorksData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  window.filteredWorksData = [...window.allWorksData];
}

// =============== 清除旧的filterWorksByTag函数引用 ===============
// 由于我们已经实现了多选标签功能，这个函数不再需要了
// 如果有其他地方引用了它，我们可以保留一个空实现
function filterWorksByTag(tag) {
  // 兼容旧代码，实际功能已迁移到toggleWorkTag
  if (tag === 'all') {
    clearSelectedWorkTags();
  } else {
    toggleWorkTag(tag);
  }
}

// =============== 渲染标签筛选HTML ===============
// =============== 渲染标签筛选HTML（✅ 增加搜索框版） ===============
function renderTagFilterHTML() {
  // 提取所有不重复的标签
  const allTags = new Set();
  window.allWorksData.forEach(work => {
    if (work.tags && work.tags.length > 0) {
      work.tags.forEach(tag => allTags.add(tag));
    }
  });
  const sortedTags = Array.from(allTags).sort();

  // 初始化选中的标签集合
  if (!window.selectedWorkTags) {
    window.selectedWorkTags = new Set();
  }

  // 计算是否有选中的标签
  const hasSelectedTags = window.selectedWorkTags.size > 0;

  let html = `
    <!-- 搜索框 + 标签筛选 合并成一行 -->
    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
      
      <!-- 第一行：搜索框 -->
      <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 15px 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <i class="fas fa-search" style="color: #667eea; font-size: 1.1rem;"></i>
          <input type="text" 
                 id="works-search-input" 
                 placeholder="搜索作品名称或角色姓名..." 
                 oninput="searchWorks()"
                 style="flex: 1; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 30px; font-size: 0.95rem; transition: all 0.3s; outline: none;"
                 onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)';"
                 onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';">
          ${window.currentSearchKeyword ? `
          <button onclick="clearWorksSearch()" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 8px; border-radius: 50%; hover:background:#f3f4f6;">
            <i class="fas fa-times-circle"></i>
          </button>
          ` : ''}
        </div>
      </div>
      
      <!-- 第二行：标签筛选 -->
      <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap; padding: 15px 20px; background: #f8fafc; border-radius: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-tags" style="color: #667eea;"></i>
          <span style="font-weight: 600; color: #4b5563;">标签筛选：</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <button id="tag-filter-all" class="tag-filter-btn-works" 
                  onclick="clearSelectedWorkTags()"
                  style="padding: 8px 20px; border: 2px solid ${!hasSelectedTags ? '#667eea' : '#e5e7eb'}; background: ${!hasSelectedTags ? '#667eea' : 'white'}; color: ${!hasSelectedTags ? 'white' : '#4b5563'}; border-radius: 30px; cursor: pointer; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
            <i class="fas fa-layer-group"></i> 全部作品
            ${!hasSelectedTags ? '<i class="fas fa-check" style="font-size: 0.8rem;"></i>' : ''}
          </button>
  `;

  sortedTags.forEach(tag => {
    const tagColor = getTagColor(tag);
    const isActive = window.selectedWorkTags.has(tag);
    html += `
      <button id="tag-filter-${tag.replace(/\s+/g, '-')}" class="tag-filter-btn-works" 
              onclick="toggleWorkTag('${tag.replace(/'/g, "\\'")}')"
              style="padding: 8px 20px; border: 2px solid ${isActive ? tagColor : '#e5e7eb'}; background: ${isActive ? tagColor : 'white'}; color: ${isActive ? 'white' : '#4b5563'}; border-radius: 30px; cursor: pointer; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
        <span style="display: inline-block; width: 10px; height: 10px; background: ${tagColor}; border-radius: 50%;"></span>
        ${tag}
        ${isActive ? '<i class="fas fa-check" style="margin-left: 4px; font-size: 0.8rem;"></i>' : ''}
      </button>
    `;
  });

  // 添加清除选中标签的按钮
  if (hasSelectedTags) {
    html += `
      <button onclick="clearSelectedWorkTags()" style="padding: 8px 20px; border: 2px solid #fecaca; background: #fee2e2; color: #dc2626; border-radius: 30px; cursor: pointer; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
        <i class="fas fa-times-circle"></i> 清除筛选
      </button>
    `;
  }

  html += `</div></div></div>`;
  return html;
}

// =============== 渲染批量操作HTML ===============
function renderBatchControlsHTML() {
  return `
    <div id="works-batch-controls" style="display: ${window.worksBatchMode ? 'flex' : 'none'}; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px 25px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #fbbf24; align-items: center; justify-content: space-between; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <h4 style="margin: 0; color: #92400e; display: flex; align-items: center; gap: 10px; font-size: 1.1rem;">
          <i class="fas fa-check-circle"></i> 批量管理模式
        </h4>
        <span style="background: white; padding: 6px 18px; border-radius: 30px; font-weight: 600; color: #92400e; border: 1px solid #fbbf24;">
          已选中 <span id="selected-works-count">0</span> 个作品
        </span>
      </div>
      <div style="display: flex; gap: 12px;">
        <button onclick="selectAllWorks()" style="padding: 8px 20px; background: white; border: 2px solid #d1d5db; border-radius: 30px; color: #4b5563; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
          <i class="fas fa-check-double"></i> 全选
        </button>
        <button onclick="deselectAllWorks()" style="padding: 8px 20px; background: white; border: 2px solid #d1d5db; border-radius: 30px; color: #4b5563; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
          <i class="fas fa-times-circle"></i> 取消全选
        </button>
        <button onclick="deleteSelectedWorks()" style="padding: 8px 25px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border: none; border-radius: 30px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3); transition: all 0.2s;">
          <i class="fas fa-trash"></i> 批量删除
        </button>
        <button onclick="exitWorksBatchMode()" style="padding: 8px 20px; background: #6b7280; border: none; border-radius: 30px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
          <i class="fas fa-times"></i> 退出
        </button>
      </div>
    </div>
    
    <div id="enter-works-batch-btn" style="margin-bottom: 20px; text-align: right; display: ${window.worksBatchMode ? 'none' : 'block'};">
      <button onclick="enterWorksBatchMode()" style="padding: 12px 25px; background: #667eea; color: white; border: none; border-radius: 30px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.2s;">
        <i class="fas fa-check-square"></i> 进入批量管理模式
      </button>
    </div>
  `;
}

// =============== 渲染作品网格 ===============
function renderWorksGrid(works) {
  if (!works || works.length === 0) {
    return `
      <div class="empty-state" style="grid-column: 1/-1; padding: 80px 20px;">
        <div class="empty-icon">
          <i class="fas fa-film" style="font-size: 4rem; color: #cbd5e0;"></i>
        </div>
        <h3 style="font-size: 1.5rem; margin-bottom: 10px;">没有找到作品</h3>
        <p style="color: #666; font-size: 1rem;">试试其他标签，或者先去角色详情页添加作品吧！</p>
      </div>
    `;
  }

  return works.map(work => {
    const workId = `${work.characterId}-${work.id}`;
    const isSelected = window.worksBatchMode && window.selectedWorkIds.has(workId);
    
    // 星星显示
    let starsHtml = '';
    if (work.rating) {
      for (let i = 0; i < work.rating; i++) starsHtml += '★';
    }

    // 标签显示
    let tagsHtml = '';
    if (work.tags && work.tags.length > 0) {
      tagsHtml = work.tags.map(tag => {
        const tagColor = getTagColor(tag);
        return `<span style="background: ${tagColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; white-space: nowrap;">${tag}</span>`;
      }).join('');
    }

    return `
      <div class="work-card" data-work-id="${workId}" 
           style="background: ${isSelected ? '#eef2ff' : 'white'}; border: 2px solid ${isSelected ? '#667eea' : '#e5e7eb'}; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s; position: relative; cursor: ${window.worksBatchMode ? 'pointer' : 'default'};"
           onclick="handleWorkCardClick(event, '${workId}')">
        
        ${window.worksBatchMode ? `
        <div style="position: absolute; top: 15px; left: 15px; z-index: 30;" onclick="event.stopPropagation()">
          <input type="checkbox" class="work-batch-checkbox" 
                 ${isSelected ? 'checked' : ''}
                 onchange="toggleWorkSelection('${workId}', this.checked)"
                 data-work-id="${workId}"
                 style="width: 24px; height: 24px; cursor: pointer; accent-color: #667eea; border-radius: 6px;">
        </div>
        ` : ''}
        
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; ${window.worksBatchMode ? 'margin-left: 40px;' : ''}">
          <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem; flex-shrink: 0;">
            <i class="fas fa-film"></i>
          </div>
          <div style="min-width: 0; flex: 1;">
            <h3 style="margin: 0; font-size: 1.3rem; color: #1a202c; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${work.title}">${work.title}</h3>
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; flex-wrap: wrap;">
              <span style="color: #667eea; font-weight: 600; font-size: 0.95rem;"><i class="fas fa-user"></i> ${work.characterName}</span>
              <span class="rank-badge rank-${work.characterRank.toLowerCase()}" style="position: static; padding: 4px 12px; font-size: 0.75rem; font-weight: 700;">${work.characterRank}</span>
            </div>
          </div>
        </div>
        
        ${work.rating ? `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; ${window.worksBatchMode ? 'margin-left: 40px;' : ''}">
          <span style="color: #ffd700; font-size: 1.2rem; letter-spacing: 3px;">${starsHtml}</span>
          <span style="color: #666; font-size: 0.8rem; background: #f3f4f6; padding: 3px 10px; border-radius: 20px; font-weight: 600;">${work.rating}/10</span>
        </div>
        ` : ''}
        
        ${tagsHtml ? `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; ${window.worksBatchMode ? 'margin-left: 40px;' : ''}">
          ${tagsHtml}
        </div>
        ` : ''}
        
        ${work.seed ? `
        <div style="background: #f8fafc; border-left: 4px solid #667eea; padding: 12px 16px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; color: #2d3748; word-break: break-word; ${window.worksBatchMode ? 'margin-left: 40px;' : ''}">
          <i class="fas fa-seedling" style="color: #10b981; margin-right: 8px;"></i>
          ${work.seed.length > 60 ? work.seed.substring(0, 60) + '...' : work.seed}
        </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #edf2f7; ${window.worksBatchMode ? 'margin-left: 40px;' : ''}">
          <span style="color: #a0aec0; font-size: 0.8rem;">
            <i class="far fa-clock"></i> ${formatDate(work.createdAt)}
          </span>
          <div style="display: flex; gap: 12px;">
            <button onclick="event.stopPropagation(); showWorkDetail('${work.characterId}', ${work.id}); document.getElementById('all-works-modal')?.remove();" 
                    style="background: none; border: none; color: #667eea; cursor: pointer; padding: 6px 14px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; hover:background:#eef2ff;">
              <i class="fas fa-edit"></i> 编辑
            </button>
            <button onclick="event.stopPropagation(); if(confirm('确定要删除作品「${work.title}」吗？')) { deleteSingleWork('${work.characterId}', ${work.id}); }" 
                    style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 6px 14px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; hover:background:#fee2e2;">
              <i class="fas fa-trash"></i> 删除
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =============== 标签筛选 ===============
function filterWorksByTag(tag) {
  window.currentWorkTagFilter = tag;
  
  if (tag === 'all') {
    window.filteredWorksData = [...window.allWorksData];
  } else {
    window.filteredWorksData = window.allWorksData.filter(work => 
      work.tags && work.tags.includes(tag)
    );
  }
  
  // 更新作品网格
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  // 更新总数
  const totalSpan = document.getElementById('total-works-count');
  if (totalSpan) {
    totalSpan.textContent = window.filteredWorksData.length;
  }
  
  // 退出批量模式
  if (window.worksBatchMode) {
    exitWorksBatchMode();
  }
}
// =============== 全局搜索关键词 ===============
window.currentSearchKeyword = '';

// =============== 搜索作品（实时） ===============
function searchWorks() {
  const searchInput = document.getElementById('works-search-input');
  if (!searchInput) return;
  
  window.currentSearchKeyword = searchInput.value.trim().toLowerCase();
  
  // 执行搜索 + 标签筛选的组合查询
  applyWorksFilters();
}

// =============== 清除搜索 ===============
function clearWorksSearch() {
  window.currentSearchKeyword = '';
  const searchInput = document.getElementById('works-search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  applyWorksFilters();
}

// =============== 切换作品标签选择 ===============
function toggleWorkTag(tag) {
  if (!window.selectedWorkTags) {
    window.selectedWorkTags = new Set();
  }
  
  if (window.selectedWorkTags.has(tag)) {
    window.selectedWorkTags.delete(tag);
  } else {
    window.selectedWorkTags.add(tag);
  }
  
  // 重新渲染整个模态框的内容，确保所有UI元素都正确更新
  const modalBody = document.querySelector('#all-works-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <!-- 标签筛选区 -->
      ${renderTagFilterHTML()}
      
      <!-- 批量操作区 -->
      ${renderBatchControlsHTML()}
      
      <!-- 作品列表网格 -->
      <div id="works-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
        ${renderWorksGrid(window.filteredWorksData)}
      </div>
    `;
  }
  
  // 应用筛选
  applyWorksFilters();
}

// =============== 清除所有选中的作品标签 ===============
function clearSelectedWorkTags() {
  if (window.selectedWorkTags) {
    window.selectedWorkTags.clear();
  }
  
  // 重新渲染整个模态框的内容，确保所有UI元素都正确更新
  const modalBody = document.querySelector('#all-works-modal .modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <!-- 标签筛选区 -->
      ${renderTagFilterHTML()}
      
      <!-- 批量操作区 -->
      ${renderBatchControlsHTML()}
      
      <!-- 作品列表网格 -->
      <div id="works-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
        ${renderWorksGrid(window.filteredWorksData)}
      </div>
    `;
  }
  
  // 应用筛选
  applyWorksFilters();
}

// =============== 应用所有筛选（搜索 + 标签） ===============
function applyWorksFilters() {
  // 1. 从所有作品开始
  let filtered = [...window.allWorksData];
  
  // 2. 应用标签筛选（支持多选）
  if (window.selectedWorkTags && window.selectedWorkTags.size > 0) {
    filtered = filtered.filter(work => {
      // 检查作品是否包含所有选中的标签
      return work.tags && Array.from(window.selectedWorkTags).every(tag => 
        work.tags.includes(tag)
      );
    });
  }
  
  // 3. 应用搜索筛选
  if (window.currentSearchKeyword) {
    filtered = filtered.filter(work => {
      // 搜索作品名称
      const titleMatch = work.title && work.title.toLowerCase().includes(window.currentSearchKeyword);
      // 搜索角色姓名
      const nameMatch = work.characterName && work.characterName.toLowerCase().includes(window.currentSearchKeyword);
      return titleMatch || nameMatch;
    });
  }
  
  window.filteredWorksData = filtered;
  
  // 更新作品网格
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  // 更新总数
  const totalSpan = document.getElementById('total-works-count');
  if (totalSpan) {
    totalSpan.textContent = window.filteredWorksData.length;
  }
  
  // 退出批量模式
  if (window.worksBatchMode) {
    exitWorksBatchMode();
  }
}

// =============== 修改原来的 filterWorksByTag 函数，让它调用 applyWorksFilters ===============
// 找到你现有的 filterWorksByTag 函数，整个替换成下面这个：

function filterWorksByTag(tag) {
  window.currentWorkTagFilter = tag;
  applyWorksFilters();
  
  // 更新标签按钮样式（这部分保持不变）
  document.querySelectorAll('.tag-filter-btn-works').forEach(btn => {
    btn.style.background = 'white';
    btn.style.borderColor = '#e5e7eb';
    btn.style.color = '#4b5563';
    const existingCheck = btn.querySelector('.fa-check');
    if (existingCheck) existingCheck.remove();
  });
  
  const activeBtn = Array.from(document.querySelectorAll('.tag-filter-btn-works')).find(
    btn => btn.textContent.includes(tag) || (tag === 'all' && btn.textContent.includes('全部作品'))
  );
  
  if (activeBtn) {
    if (tag === 'all') {
      activeBtn.style.background = '#667eea';
      activeBtn.style.borderColor = '#667eea';
      activeBtn.style.color = 'white';
    } else {
      const tagColor = getTagColor(tag);
      activeBtn.style.background = tagColor;
      activeBtn.style.borderColor = tagColor;
      activeBtn.style.color = 'white';
      if (!activeBtn.querySelector('.fa-check')) {
        activeBtn.innerHTML += ' <i class="fas fa-check" style="margin-left: 4px; font-size: 0.8rem;"></i>';
      }
    }
  }
}
// =============== 进入批量模式 ===============
function enterWorksBatchMode() {
  window.worksBatchMode = true;
  window.selectedWorkIds.clear();
  
  // 更新UI
  document.getElementById('enter-works-batch-btn').style.display = 'none';
  document.getElementById('works-batch-controls').style.display = 'flex';
  
  // 重新渲染网格
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  updateSelectedWorksCount();
}

// =============== 退出批量模式 ===============
function exitWorksBatchMode() {
  window.worksBatchMode = false;
  window.selectedWorkIds.clear();
  
  // 更新UI
  document.getElementById('enter-works-batch-btn').style.display = 'block';
  document.getElementById('works-batch-controls').style.display = 'none';
  
  // 重新渲染网格
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
}

// =============== 全选 ===============
function selectAllWorks() {
  window.selectedWorkIds.clear();
  window.filteredWorksData.forEach(work => {
    const workId = `${work.characterId}-${work.id}`;
    window.selectedWorkIds.add(workId);
  });
  
  // 更新所有复选框
  document.querySelectorAll('.work-batch-checkbox').forEach(checkbox => {
    checkbox.checked = true;
  });
  
  // 更新卡片样式
  document.querySelectorAll('.work-card').forEach(card => {
    const workId = card.dataset.workId;
    if (window.selectedWorkIds.has(workId)) {
      card.style.background = '#eef2ff';
      card.style.borderColor = '#667eea';
    }
  });
  
  updateSelectedWorksCount();
}

// =============== 取消全选 ===============
function deselectAllWorks() {
  window.selectedWorkIds.clear();
  
  // 更新所有复选框
  document.querySelectorAll('.work-batch-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // 更新卡片样式
  document.querySelectorAll('.work-card').forEach(card => {
    card.style.background = 'white';
    card.style.borderColor = '#e5e7eb';
  });
  
  updateSelectedWorksCount();
}

// =============== 切换作品选中状态 ===============
function toggleWorkSelection(workId, isChecked) {
  if (event) {
    event.stopPropagation();
  }
  
  if (isChecked) {
    window.selectedWorkIds.add(workId);
  } else {
    window.selectedWorkIds.delete(workId);
  }
  
  // 更新卡片样式
  const card = document.querySelector(`.work-card[data-work-id="${workId}"]`);
  if (card) {
    if (isChecked) {
      card.style.background = '#eef2ff';
      card.style.borderColor = '#667eea';
    } else {
      card.style.background = 'white';
      card.style.borderColor = '#e5e7eb';
    }
  }
  
  updateSelectedWorksCount();
}

// =============== 处理卡片点击 ===============
function handleWorkCardClick(event, workId) {
  // 如果是点击复选框、按钮，不处理
  if (event.target.tagName === 'INPUT' || 
      event.target.tagName === 'BUTTON' ||
      event.target.closest('button') ||
      event.target.closest('input') ||
      event.target.closest('.work-batch-checkbox')) {
    return;
  }
  
  // 非批量模式下，点击卡片不做任何事
  if (!window.worksBatchMode) {
    return;
  }
  
  // 批量模式下，点击卡片切换选中状态
  const checkbox = document.querySelector(`.work-card[data-work-id="${workId}"] .work-batch-checkbox`);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    toggleWorkSelection(workId, checkbox.checked);
  }
}

// =============== 更新选中数量 ===============
function updateSelectedWorksCount() {
  const countElement = document.getElementById('selected-works-count');
  if (countElement) {
    countElement.textContent = window.selectedWorkIds.size;
  }
}

// =============== 批量删除 ===============
function deleteSelectedWorks() {
  const selectedCount = window.selectedWorkIds.size;
  if (selectedCount === 0) {
    alert('请先选择要删除的作品！');
    return;
  }
  
  if (!confirm(`确定要删除选中的 ${selectedCount} 个作品吗？此操作不可撤销！`)) {
    return;
  }
  
  let deletedCount = 0;
  
  window.selectedWorkIds.forEach(workId => {
    const [characterId, workIdStr] = workId.split('-');
    const workNumericId = parseInt(workIdStr);
    
    const character = characters.find(c => c.id.toString() === characterId);
    if (character && character.works) {
      const workIndex = character.works.findIndex(w => w.id === workNumericId);
      if (workIndex !== -1) {
        character.works.splice(workIndex, 1);
        deletedCount++;
      }
    }
  });
  
  // 保存数据
  saveCharacterWorks();
  saveCharacters();
  
  // 重新收集作品数据
  collectAllWorksData();
  
  // 重新应用当前标签筛选
  if (window.currentWorkTagFilter === 'all') {
    window.filteredWorksData = [...window.allWorksData];
  } else {
    window.filteredWorksData = window.allWorksData.filter(w => 
      w.tags && w.tags.includes(window.currentWorkTagFilter)
    );
  }
  
  // 清空选中
  window.selectedWorkIds.clear();
  
  // 重新渲染
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  // 更新总数
  const totalSpan = document.getElementById('total-works-count');
  if (totalSpan) {
    totalSpan.textContent = window.filteredWorksData.length;
  }
  
  updateSelectedWorksCount();
  renderCharacterList();
  
  alert(`✅ 成功删除 ${deletedCount} 个作品！`);
}

// =============== 删除单个作品 ===============
function deleteSingleWork(characterId, workId) {
  const character = characters.find(c => c.id.toString() === characterId.toString());
  if (character && character.works) {
    const workIndex = character.works.findIndex(w => w.id === workId);
    if (workIndex !== -1) {
      const workTitle = character.works[workIndex].title;
      character.works.splice(workIndex, 1);
      
      saveCharacterWorks();
      saveCharacters();
      renderCharacterList();
      
      // 刷新全部作品页（如果开着）
      const modal = document.getElementById('all-works-modal');
      if (modal) {
        collectAllWorksData();
        
        if (window.currentWorkTagFilter === 'all') {
          window.filteredWorksData = [...window.allWorksData];
        } else {
          window.filteredWorksData = window.allWorksData.filter(w => 
            w.tags && w.tags.includes(window.currentWorkTagFilter)
          );
        }
        
        const container = document.getElementById('works-grid-container');
        if (container) {
          container.innerHTML = renderWorksGrid(window.filteredWorksData);
        }
        
        const totalSpan = document.getElementById('total-works-count');
        if (totalSpan) {
          totalSpan.textContent = window.filteredWorksData.length;
        }
      }
      
      alert(`✅ 已删除作品: ${workTitle}`);
    }
  }
}
// =============== 存储管理工具 ===============

// 检查localStorage剩余空间
function checkStorageSpace() {
  try {
    // 测试写入1KB数据来检查可用空间
    const testKey = 'storage_test_' + Date.now();
    const testData = 'x'.repeat(1024); // 1KB测试数据
    
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    
    return { available: true, message: '存储空间充足' };
  } catch (e) {
    return { available: false, message: '存储空间不足，请清理数据或使用优化功能' };
  }
}

// 清理存储空间
function cleanupStorage() {
  const originalSize = JSON.stringify(characters).length;
  let cleanedCount = 0;
  let spaceSaved = 0;
  
  // 清理没有头像的角色数据
  characters.forEach(character => {
    if (character.avatar && character.avatar.length > 100000) { // 大于100KB的头像
      const oldSize = character.avatar.length;
      // 重新压缩大尺寸头像
      compressImage(character.avatar, 150, 150, 0.6, function(compressedData) {
        character.avatar = compressedData;
        spaceSaved += (oldSize - compressedData.length);
        cleanedCount++;
      });
    }
  });
  
  // 保存清理后的数据
  if (saveCharacters()) {
    const newSize = JSON.stringify(characters).length;
    const totalSaved = originalSize - newSize;
    
    showMessage(`存储清理完成！清理了 ${cleanedCount} 个头像，节省了 ${Math.round(totalSaved/1024)}KB 空间`, 'success');
    return true;
  }
  
  return false;
}

// 导出头像到本地文件系统（减少localStorage占用）
function exportAvatarsToFiles() {
  const avatarData = {};
  
  characters.forEach(character => {
    if (character.avatar) {
      avatarData[character.id] = character.avatar;
      // 从角色数据中移除头像，只保留引用
      character.avatar = null;
      character.avatarRef = character.id; // 保存引用
    }
  });
  
  // 保存头像数据到单独的文件
  localStorage.setItem('characterAvatars', JSON.stringify(avatarData));
  
  // 保存角色数据（不包含头像）
  if (saveCharacters()) {
    showMessage('头像已导出到独立存储，释放了主存储空间', 'success');
    return true;
  }
  
  return false;
}

// 从文件系统加载头像
function loadAvatarFromStorage(characterId) {
  const avatarData = JSON.parse(localStorage.getItem('characterAvatars') || '{}');
  return avatarData[characterId] || null;
}

// 获取角色头像（支持独立存储）
function getCharacterAvatar(character) {
  if (character.avatar) {
    return character.avatar;
  }
  if (character.avatarRef) {
    return loadAvatarFromStorage(character.avatarRef);
  }
  return null;
}

// 检查存储状态并更新界面
function updateStorageStatus() {
  const statusElement = document.getElementById('storage-status');
  const sizeElement = document.getElementById('data-size');
  
  if (!statusElement || !sizeElement) return;
  
  const storageCheck = checkStorageSpace();
  statusElement.textContent = storageCheck.available ? '✅ 空间充足' : '⚠️ 空间不足';
  statusElement.style.color = storageCheck.available ? '#10b981' : '#ef4444';
  
  // 计算数据大小
  const charactersData = JSON.stringify(characters);
  const avatarData = localStorage.getItem('characterAvatars') || '';
  const totalSize = charactersData.length + avatarData.length;
  
  sizeElement.textContent = `${Math.round(totalSize/1024)}KB`;
}

// 删除所有头像
function clearAllAvatars() {
  if (!confirm('确定要删除所有角色的头像吗？此操作不可撤销！')) {
    return;
  }
  
  let clearedCount = 0;
  characters.forEach(character => {
    if (character.avatar || character.avatarRef) {
      character.avatar = null;
      character.avatarRef = null;
      clearedCount++;
    }
  });
  
  // 清理独立存储的头像数据
  localStorage.removeItem('characterAvatars');
  
  if (saveCharacters()) {
    renderCharacterList();
    updateStorageStatus();
    showMessage(`已删除 ${clearedCount} 个角色的头像`, 'success');
  }
}

// =============== 增强版头像上传功能 ===============
function uploadCharacterAvatar(characterId, event) {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  // 先检查存储空间
  const storageCheck = checkStorageSpace();
  if (!storageCheck.available) {
    // 提供清理选项
    if (confirm('存储空间不足！是否立即清理存储空间？')) {
      cleanupStorage();
    }
    return;
  }
  
  // 创建隐藏的文件输入框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  // 添加文件大小限制（2MB，更严格）
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小（最大2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      showMessage('图片文件太大，请选择小于2MB的图片', 'error');
      return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showMessage('请选择图片文件', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const imageData = event.target.result; // base64 格式
      
      // 使用增强压缩（更小的尺寸和更低的质量）
      compressImage(imageData, 150, 150, 0.6, function(compressedData) {
        // 找到对应角色
        const character = characters.find(c => c.id.toString() === characterId);
        if (character) {
          character.avatar = compressedData;
          character.updatedAt = new Date().toISOString();
          
          // 保存到 localStorage
          if (saveCharacters()) {
            renderCharacterList(); // 刷新列表显示新头像
            showMessage(`已更新 ${character.name} 的头像（优化压缩）`, 'success');
          } else {
            // 保存失败，尝试清理空间后重试
            if (cleanupStorage()) {
              if (saveCharacters()) {
                renderCharacterList();
                showMessage(`已更新 ${character.name} 的头像（自动清理后）`, 'success');
              } else {
                showMessage('保存失败，请手动清理存储空间', 'error');
              }
            } else {
              showMessage('保存失败，存储空间严重不足', 'error');
            }
          }
        }
      });
    };
    
    reader.onerror = function() {
      showMessage('读取文件失败，请重试', 'error');
    };
    
    reader.readAsDataURL(file);
  };
  input.click();
}

// 增强版图片压缩函数
function compressImage(imageData, maxWidth, maxHeight, quality, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算压缩比例（更激进的压缩）
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    
    // 进一步缩小尺寸（如果仍然较大）
    if (width * height > 50000) { // 如果像素数超过5万
      const scale = Math.sqrt(50000 / (width * height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 提高压缩质量但降低分辨率
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制压缩后的图片
    ctx.drawImage(img, 0, 0, width, height);
    
    // 转换为base64格式（更低的质量设置）
    const compressedData = canvas.toDataURL('image/jpeg', quality);
    callback(compressedData);
  };
  
  img.onerror = function() {
    // 如果压缩失败，返回原始数据但进行基本压缩
    const tempImg = new Image();
    tempImg.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.min(tempImg.width, 200);
      canvas.height = Math.min(tempImg.height, 200);
      ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
      const fallbackData = canvas.toDataURL('image/jpeg', 0.5);
      callback(fallbackData);
    };
    tempImg.src = imageData;
  };
  
  img.src = imageData;
}
// =============== 关闭所有下拉菜单（安全兜底） ===============
function closeAllDropdowns() {
  // 如果你有具体的下拉菜单逻辑，可以在这里写
  // 比如：document.querySelectorAll('.dropdown').forEach(el => el.classList.remove('open'));
  // 现在先留空，防止报错
// =============== 作品标签筛选功能（✅ 修复点击无反应版） ===============
window.currentWorkTagFilter = 'all';

function filterWorksByTag(tag) {
  // 更新当前选中的标签
  window.currentWorkTagFilter = tag;
  
  // 如果没有作品数据，先重新收集
  if (!window.allWorksData || window.allWorksData.length === 0) {
    window.allWorksData = [];
    characters.forEach(character => {
      if (character.works && character.works.length > 0) {
        character.works.forEach(work => {
          window.allWorksData.push({
            ...work,
            characterId: character.id,
            characterName: character.name,
            characterRank: character.rank
          });
        });
      }
    });
  }
  
  // 根据标签筛选作品
  if (tag === 'all') {
    window.filteredWorksData = [...window.allWorksData];
  } else {
    window.filteredWorksData = window.allWorksData.filter(work => 
      work.tags && work.tags.includes(tag)
    );
  }
  
  // 重新渲染作品网格
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  // 更新总作品数
  const totalSpan = document.getElementById('total-works-count');
  if (totalSpan) {
    totalSpan.textContent = window.filteredWorksData.length;
  }
  
  // 更新所有标签按钮的样式
  document.querySelectorAll('.tag-filter-btn-works').forEach(btn => {
    btn.style.background = 'white';
    btn.style.borderColor = '#e5e7eb';
    btn.style.color = '#4b5563';
    
    // 移除已有的对勾图标
    const existingCheck = btn.querySelector('.fa-check');
    if (existingCheck) existingCheck.remove();
  });
  
  // 高亮当前选中的标签按钮
  const activeBtn = Array.from(document.querySelectorAll('.tag-filter-btn-works')).find(
    btn => btn.textContent.includes(tag) || (tag === 'all' && btn.textContent.includes('全部作品'))
  );
  
  if (activeBtn) {
    if (tag === 'all') {
      activeBtn.style.background = '#667eea';
      activeBtn.style.borderColor = '#667eea';
      activeBtn.style.color = 'white';
    } else {
      const tagColor = getTagColor(tag);
      activeBtn.style.background = tagColor;
      activeBtn.style.borderColor = tagColor;
      activeBtn.style.color = 'white';
      // 添加对勾图标
      if (!activeBtn.querySelector('.fa-check')) {
        activeBtn.innerHTML += ' <i class="fas fa-check" style="margin-left: 4px; font-size: 0.8rem;"></i>';
      }
    }
  }
  
  // 退出批量模式（如果有）
  if (window.worksBatchMode) {
    exitWorksBatchMode();
  }
}
// =============== 切换作品选中状态（✅ 修复多选问题） ===============
function toggleWorkSelection(workId, isChecked) {
  // 阻止事件冒泡
  if (event) {
    event.stopPropagation();
  }
  
  // 初始化 selectedWorkIds
  if (!window.selectedWorkIds) {
    window.selectedWorkIds = new Set();
  }
  
  // 根据复选框状态添加或移除
  if (isChecked) {
    window.selectedWorkIds.add(workId);
  } else {
    window.selectedWorkIds.delete(workId);
  }
  
  // 更新卡片样式
  const card = document.querySelector(`.work-card[data-work-id="${workId}"]`);
  if (card) {
    if (isChecked) {
      card.style.background = '#eef2ff';
      card.style.borderColor = '#667eea';
    } else {
      card.style.background = 'white';
      card.style.borderColor = '#e5e7eb';
    }
  }
  
  // 更新选中数量显示
  updateSelectedWorksCount();
}

// =============== 修复 handleWorkCardClick 函数 ===============
function handleWorkCardClick(event, workId) {
  // 如果是点击复选框、按钮或它们的父元素，不处理
  if (event.target.tagName === 'INPUT' || 
      event.target.tagName === 'BUTTON' ||
      event.target.closest('button') ||
      event.target.closest('input') ||
      event.target.closest('.work-batch-checkbox')) {
    return;
  }
  
  // 只有在批量模式下，点击卡片才切换选中状态
  if (!window.worksBatchMode) return;
  
  // 获取当前复选框
  const card = event.currentTarget;
  const checkbox = card.querySelector('.work-batch-checkbox');
  
  if (checkbox) {
    // 切换复选框状态
    checkbox.checked = !checkbox.checked;
    // 调用 toggleWorkSelection 函数
    toggleWorkSelection(workId, checkbox.checked);
  }
}
// =============== 作品批量管理功能 ===============
function enterWorksBatchMode() {
  window.worksBatchMode = true;
  if (!window.selectedWorkIds) {
    window.selectedWorkIds = new Set();
  }
  
  document.getElementById('enter-works-batch-btn').style.display = 'none';
  document.getElementById('works-batch-controls').style.display = 'flex';
  
  // 重新渲染，显示复选框
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData || window.allWorksData || []);
  }
  
  updateSelectedWorksCount();
}

function exitWorksBatchMode() {
  window.worksBatchMode = false;
  window.selectedWorkIds = new Set();
  
  document.getElementById('enter-works-batch-btn').style.display = 'block';
  document.getElementById('works-batch-controls').style.display = 'none';
  
  // 重新渲染，隐藏复选框
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData || window.allWorksData || []);
  }
}

function selectAllWorks() {
  window.selectedWorkIds.clear();
  
  const currentWorks = window.filteredWorksData || window.allWorksData || [];
  currentWorks.forEach(work => {
    const workId = `${work.characterId}-${work.id}`;
    window.selectedWorkIds.add(workId);
  });
  
  updateAllWorksCheckboxes();
  updateSelectedWorksCount();
}

function deselectAllWorks() {
  window.selectedWorkIds.clear();
  updateAllWorksCheckboxes();
  updateSelectedWorksCount();
}

function updateAllWorksCheckboxes() {
  document.querySelectorAll('.work-card').forEach(card => {
    const checkbox = card.querySelector('.work-batch-checkbox');
    const workId = card.dataset.workId;
    
    if (checkbox && workId) {
      checkbox.checked = window.selectedWorkIds.has(workId);
      if (window.selectedWorkIds.has(workId)) {
        card.style.background = '#eef2ff';
        card.style.borderColor = '#667eea';
      } else {
        card.style.background = 'white';
        card.style.borderColor = '#e5e7eb';
      }
    }
  });
}

function updateSelectedWorksCount() {
  const countElement = document.getElementById('selected-works-count');
  if (countElement) {
    countElement.textContent = window.selectedWorkIds ? window.selectedWorkIds.size : 0;
  }
}

function handleWorkCardClick(event, workId) {
  // 如果是点击复选框或按钮，不处理
  if (event.target.tagName === 'INPUT' || 
      event.target.tagName === 'BUTTON' ||
      event.target.closest('button') ||
      event.target.closest('input')) {
    return;
  }
  
  if (!window.worksBatchMode) return;
  
  // 批量模式下，点击卡片切换选中状态
  if (window.selectedWorkIds.has(workId)) {
    window.selectedWorkIds.delete(workId);
  } else {
    window.selectedWorkIds.add(workId);
  }
  
  const card = event.currentTarget;
  const checkbox = card.querySelector('.work-batch-checkbox');
  if (checkbox) {
    checkbox.checked = window.selectedWorkIds.has(workId);
  }
  
  if (window.selectedWorkIds.has(workId)) {
    card.style.background = '#eef2ff';
    card.style.borderColor = '#667eea';
  } else {
    card.style.background = 'white';
    card.style.borderColor = '#e5e7eb';
  }
  
  updateSelectedWorksCount();
}

function deleteSelectedWorks() {
  const selectedCount = window.selectedWorkIds.size;
  if (selectedCount === 0) {
    alert('请先选择要删除的作品');
    return;
  }
  
  if (!confirm(`确定要删除选中的 ${selectedCount} 个作品吗？此操作不可撤销！`)) {
    return;
  }
  
  let deletedCount = 0;
  
  window.selectedWorkIds.forEach(workId => {
    const [characterId, workIdStr] = workId.split('-');
    const workNumericId = parseInt(workIdStr);
    
    const character = characters.find(c => c.id.toString() === characterId);
    if (character && character.works) {
      const workIndex = character.works.findIndex(w => w.id === workNumericId);
      if (workIndex !== -1) {
        character.works.splice(workIndex, 1);
        deletedCount++;
      }
    }
  });
  
  // 保存数据
  saveCharacterWorks();
  saveCharacters();
  
  // 重新整理作品数据
  window.allWorksData = [];
  characters.forEach(character => {
    if (character.works) {
      character.works.forEach(work => {
        window.allWorksData.push({
          ...work,
          characterId: character.id,
          characterName: character.name,
          characterRank: character.rank
        });
      });
    }
  });
  
  // 重新应用当前标签筛选
  window.filteredWorksData = window.currentWorkTagFilter === 'all' 
    ? [...window.allWorksData] 
    : window.allWorksData.filter(w => w.tags && w.tags.includes(window.currentWorkTagFilter));
  
  // 清空选中
  window.selectedWorkIds.clear();
  
  // 重新渲染
  const container = document.getElementById('works-grid-container');
  if (container) {
    container.innerHTML = renderWorksGrid(window.filteredWorksData);
  }
  
  // 更新总数
  const totalSpan = document.getElementById('total-works-count');
  if (totalSpan) {
    totalSpan.textContent = window.filteredWorksData.length;
  }
  
  updateSelectedWorksCount();
  renderCharacterList(); // 更新角色卡片上的作品数量
  
  alert(`✅ 成功删除 ${deletedCount} 个作品`);
}

function deleteSingleWork(characterId, workId) {
  const character = characters.find(c => c.id.toString() === characterId.toString());
  if (character && character.works) {
    const workIndex = character.works.findIndex(w => w.id === workId);
    if (workIndex !== -1) {
      const workTitle = character.works[workIndex].title;
      character.works.splice(workIndex, 1);
      
      saveCharacterWorks();
      saveCharacters();
      renderCharacterList();
      
      // 刷新全部作品页（如果开着）
      const modal = document.getElementById('all-works-modal');
      if (modal) {
        // 重新整理数据
        window.allWorksData = [];
        characters.forEach(c => {
          if (c.works) {
            c.works.forEach(w => {
              window.allWorksData.push({
                ...w,
                characterId: c.id,
                characterName: c.name,
                characterRank: c.rank
              });
            });
          }
        });
        
        window.filteredWorksData = window.currentWorkTagFilter === 'all'
          ? [...window.allWorksData]
          : window.allWorksData.filter(w => w.tags && w.tags.includes(window.currentWorkTagFilter));
        
        const container = document.getElementById('works-grid-container');
        if (container) {
          container.innerHTML = renderWorksGrid(window.filteredWorksData);
        }
        
        const totalSpan = document.getElementById('total-works-count');
        if (totalSpan) {
          totalSpan.textContent = window.filteredWorksData.length;
        }
      }
      
      alert(`✅ 已删除作品: ${workTitle}`);
    }
  }
}
}
// =============== 解析作品CSV（✅ 支持模糊匹配版） ===============
function parseWorksCSV(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    showMessage('CSV文件为空', 'error');
    return;
  }
  
  // 自动检测分隔符
  let delimiter = ',';
  const firstLine = lines[0];
  
  if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  } else if (firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '\t';
  }
  
  // 解析表头
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  // 智能查找列名
  let workTitleIndex = -1;
  let characterNameIndex = -1;
  let ratingIndex = -1;
  let tagsIndex = -1;
  let seedIndex = -1;
  let descriptionIndex = -1;
  
  headers.forEach((header, index) => {
    const h = header.toLowerCase().replace(/\s+/g, '');
    
    if (h.includes('作品名称') || h.includes('作品名') || h.includes('标题') || h.includes('work') || h.includes('title')) {
      workTitleIndex = index;
    }
    if (h.includes('角色姓名') || h.includes('角色名') || h.includes('姓名') || h.includes('character') || h.includes('name')) {
      characterNameIndex = index;
    }
    if (h.includes('评分') || h.includes('星级') || h.includes('rating') || h.includes('star')) {
      ratingIndex = index;
    }
    if (h.includes('标签') || h.includes('tag') || h.includes('tags')) {
      tagsIndex = index;
    }
    if (h.includes('种子') || h.includes('seed')) {
      seedIndex = index;
    }
    if (h.includes('简介') || h.includes('描述') || h.includes('description') || h.includes('intro')) {
      descriptionIndex = index;
    }
  });
  
  // 检查必要列
  if (workTitleIndex === -1 || characterNameIndex === -1) {
    showMessage(`CSV文件需要包含"作品名称"和"角色姓名"列\n\n当前表头: ${headers.join(' | ')}`, 'error');
    return;
  }
  
  // 准备导入结果统计
  let successCount = 0;
  let failCount = 0;
  const results = [];
  const fuzzyMatches = []; // 记录模糊匹配成功的情况
  
  // 从第二行开始解析数据
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLineSimple(lines[i], delimiter);
      if (values.length < headers.length) continue;
      
      const workTitle = values[workTitleIndex] ? values[workTitleIndex].trim() : '';
      let characterName = values[characterNameIndex] ? values[characterNameIndex].trim() : '';
      
      if (!workTitle || !characterName) {
        failCount++;
        results.push(`❌ 第${i+1}行: 作品名称或角色姓名为空`);
        continue;
      }
      
      // ========== 模糊匹配角色 ==========
      // 1. 先尝试精确匹配（不区分大小写）
      let character = characters.find(c => 
        c.name.toLowerCase() === characterName.toLowerCase()
      );
      
      // 2. 如果精确匹配失败，尝试模糊匹配
      let isFuzzyMatch = false;
      if (!character) {
        character = findCharacterFuzzy(characterName, 0.6);
        if (character) {
          isFuzzyMatch = true;
          fuzzyMatches.push({
            row: i+1,
            inputName: characterName,
            matchedName: character.name,
            similarity: stringSimilarity(characterName, character.name).toFixed(2)
          });
        }
      }
      
      // 3. 如果还是找不到，报错
      if (!character) {
        failCount++;
        results.push(`❌ 第${i+1}行: 找不到角色「${characterName}」`);
        continue;
      }
      
      // 初始化作品数组
      if (!character.works) {
        character.works = [];
      }
      
      // 检查是否已存在相同作品（不区分大小写）
      const existingWork = character.works.find(w => 
        w.title.toLowerCase() === workTitle.toLowerCase()
      );
      
      if (existingWork) {
        failCount++;
        results.push(`⚠️ 第${i+1}行: 作品已存在 - ${character.name} - ${workTitle}`);
        continue;
      }
      
      // 解析评分
      let rating = 0;
      if (ratingIndex !== -1 && values[ratingIndex]) {
        const parsedRating = parseInt(values[ratingIndex]);
        if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 10) {
          rating = parsedRating;
        }
      }
      
      // 解析标签
      let tags = [];
      if (tagsIndex !== -1 && values[tagsIndex]) {
        tags = values[tagsIndex]
          .split(/[,，;；|]/)
          .map(t => t.trim())
          .filter(t => t);
      }
      
      // 创建作品对象
      const work = {
        id: Date.now() + successCount + i,
        title: workTitle,
        seed: seedIndex !== -1 ? values[seedIndex] || '' : '',
        rating: rating,
        tags: tags,
        description: descriptionIndex !== -1 ? values[descriptionIndex] || '' : '',
        createdAt: new Date().toISOString()
      };
      
      character.works.push(work);
      successCount++;
      
      // 记录结果
      let resultMsg = `✅ ${character.name} - ${workTitle}${rating ? ` [${rating}星]` : ''}`;
      if (isFuzzyMatch) {
        resultMsg += ` (模糊匹配: "${characterName}" → "${character.name}")`;
      }
      results.push(resultMsg);
      
    } catch (error) {
      failCount++;
      results.push(`❌ 第${i+1}行解析失败: ${error.message}`);
    }
  }
  
  // 保存数据
  saveCharacterWorks();
  saveCharacters();
  
  // 刷新界面
  renderCharacterList();
  
  // 显示导入结果（增强版）
  showImportResultsWithFuzzy(successCount, failCount, results, fuzzyMatches);
}

// =============== 显示导入结果（带模糊匹配提示） ===============
function showImportResultsWithFuzzy(success, fail, results, fuzzyMatches) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  
  // 分离成功和失败
  const successResults = results.filter(r => r.includes('✅'));
  const failResults = results.filter(r => r.includes('❌') || r.includes('⚠️'));
  
  // 生成模糊匹配提示HTML
  let fuzzyHtml = '';
  if (fuzzyMatches && fuzzyMatches.length > 0) {
    fuzzyHtml = `
      <div style="margin-bottom: 20px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 15px;">
        <h4 style="color: #9a3412; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-magic" style="color: #f97316;"></i> 智能模糊匹配（${fuzzyMatches.length} 个）
        </h4>
        <div style="max-height: 150px; overflow-y: auto; background: white; padding: 12px; border-radius: 8px;">
          ${fuzzyMatches.map(m => `
            <div style="padding: 6px 0; border-bottom: 1px dashed #fed7aa; display: flex; align-items: center; gap: 10px;">
              <span style="background: #f97316; color: white; border-radius: 20px; padding: 2px 10px; font-size: 0.75rem; font-weight: bold;">第${m.row}行</span>
              <span style="color: #6b7280; text-decoration: line-through;">${m.inputName}</span>
              <i class="fas fa-arrow-right" style="color: #f97316;"></i>
              <span style="color: #2563eb; font-weight: 600;">${m.matchedName}</span>
              <span style="color: #6b7280; font-size: 0.75rem;">相似度 ${m.similarity}</span>
            </div>
          `).join('')}
        </div>
        <p style="color: #9a3412; font-size: 0.85rem; margin-top: 10px;">
          <i class="fas fa-info-circle"></i> 这些角色名不完全一致，但系统智能匹配到了最相似的角色
        </p>
      </div>
    `;
  }
  
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h2><i class="fas fa-file-import" style="color: white;"></i> 作品导入结果</h2>
        <button class="modal-close" onclick="this.parentElement.remove()">×</button>
      </div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding: 25px;">
        <!-- 统计卡片 -->
        <div style="display: flex; gap: 20px; margin-bottom: 25px;">
          <div style="flex: 1; text-align: center; padding: 25px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 16px;">
            <div style="font-size: 2.8rem; font-weight: bold; color: #10b981;">${success}</div>
            <div style="color: #059669; font-weight: 500;">成功导入</div>
          </div>
          <div style="flex: 1; text-align: center; padding: 25px; background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 16px;">
            <div style="font-size: 2.8rem; font-weight: bold; color: #ef4444;">${fail}</div>
            <div style="color: #b91c1c; font-weight: 500;">失败/跳过</div>
          </div>
        </div>
        
        <!-- 模糊匹配提示区 -->
        ${fuzzyHtml}
        
        ${successResults.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #10b981; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle"></i> 成功导入 (${successResults.length})
          </h4>
          <div style="max-height: 200px; overflow-y: auto; background: #f0fdf4; padding: 15px; border-radius: 12px; border: 1px solid #bbf7d0;">
            ${successResults.map(r => `<div style="padding: 6px 0; border-bottom: 1px dashed #bbf7d0; font-size: 0.95rem;">${r}</div>`).join('')}
          </div>
        </div>
        ` : ''}
        
        ${failResults.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #ef4444; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-exclamation-circle"></i> 失败/跳过 (${failResults.length})
          </h4>
          <div style="max-height: 200px; overflow-y: auto; background: #fef2f2; padding: 15px; border-radius: 12px; border: 1px solid #fecaca;">
            ${failResults.map(r => `<div style="padding: 6px 0; border-bottom: 1px dashed #fecaca; font-size: 0.95rem;">${r}</div>`).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 25px;">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()" style="padding: 12px 40px; font-size: 1rem;">
            <i class="fas fa-check"></i> 完成
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  if (success > 0) {
    let message = `✨ 成功导入 ${success} 个作品`;
    if (fuzzyMatches.length > 0) {
      message += `（其中 ${fuzzyMatches.length} 个使用了模糊匹配）`;
    }
    showMessage(message, 'success');
  } else {
    showMessage(`❌ 导入失败 ${fail} 个错误`, 'error');
  }
}
// =============== 导入作品CSV（最终修复版） ===============
function importWorksFromCSV() {
  // 检查是否有角色
  if (characters.length === 0) {
    showMessage('请先添加角色，再导入作品', 'warning');
    return;
  }
  
  // 创建文件选择框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      parseWorksCSV(e.target.result);
    };
    reader.readAsText(file);
  };
  
  input.click();
}