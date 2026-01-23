/**
 * dev-flatten-text-to-ai.js
 *
 * 📌 脚本用途：
 * 将指定文件或文件夹（递归遍历子文件夹）中的源代码文件内容扁平化整合，
 * 输出为一个单独的 `.txt` 文件，方便与 AI 进行项目内容交流。
 *
 * 🛠️ 功能说明：
 * 1. 接收一个绝对路径参数（文件或文件夹）。
 * 2. 遍历路径下所有文件，筛选出符合指定扩展名的文件（可在 FILE_TYPES 中配置）。
 * 3. 将每个文件的绝对路径与内容写入到一个 txt 文件中，格式如下：
 *
 *    【文件绝对路径】
 *
 *    文件文本内容
 *
 *
 *    【文件绝对路径】
 *
 *    文件文本内容
 *
 *    （文件之间空两行）
 *
 * 4. 输出文件名规则：
 *    - 前缀：当前时间戳，格式 `YYYYMMDD-HHmmss-SSS_`
 *    - 后缀：将输入路径转换为合法文件名（斜杠、反斜杠、冒号替换为下划线）
 *    - 示例：`20251207-181533-000_C__Users_Haruki_Desktop_myproject.txt`
 *
 * 📂 输出位置：
 * - 统一生成在项目根目录下的 `temp/` 文件夹中。
 *
 * ⚙️ 可配置变量：
 * - FILE_TYPES: string[] → 需要处理的文件类型扩展名数组，例如 ['.js', '.ts', '.vue']
 *
 * 🚀 使用方法：
 *   node project-tools-node/dev-flatten-text-to-ai.js "绝对路径"
 *
 *   示例：
 *   node project-tools-node/dev-flatten-text-to-ai.js "C:/Users/Haruki/Desktop/myproject"
 *
 * 📑 注意事项：
 * - 输入路径必须为绝对路径。
 * - 如果输入的是文件，则仅处理该文件。
 * - 如果输入的是文件夹，则递归遍历所有子文件夹。
 * - 若没有找到符合条件的文件，脚本会提示并退出。
 *
 */

/*
CMD
node dev-flatten-text-to-ai.js ^
"E:\Project\pocket-chat\vue3\src\views\image" ^
"E:\Project\pocket-chat\vue3\src\components" ^
"E:\Project\pocket-chat\vue3\src\utils"

PowerShell
node dev-flatten-text-to-ai.js `
"E:\Project\pocket-chat\vue3\src\views\image" `
"E:\Project\pocket-chat\vue3\src\components" `
"E:\Project\pocket-chat\vue3\src\utils"

Bash
node dev-flatten-text-to-ai.js \
"E:/Project/pocket-chat/vue3/src/views/image" \
"E:/Project/pocket-chat/vue3/src/components" \
"E:/Project/pocket-chat/vue3/src/utils"

*/

const fs = require("fs");
const path = require("path");

/**
 * 可配置变量：要处理的文件类型
 * @type {string[]}
 */
const FILE_TYPES = [".js", ".JS", ".ts", ".TS", ".vue", ".VUE", '.md', '.json', '.sh', '.html', 'Dockerfile', 'Dockerfile.release'];

// 可配置变量：要排除的文件类型
/** @type {string[]} */
const EXCLUDE_TYPES = ["pnpm-lock.yaml"];

// 可配置变量：要排除的路径片段（目录或文件路径）
// 注意：统一转小写，并把斜杠和反斜杠都当成 "/"
const EXCLUDE_PATHS = [
  "node_modules",
];

/**
 * 获取当前时间字符串，格式：YYYYMMDD-HHmmss-SSS
 */
function getTimestampPrefix() {
  const now = new Date();
  const pad = (/** @type {number} */ n, width = 2) => String(n).padStart(width, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    "-" +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    "-" +
    pad(now.getMilliseconds(), 3)
  );
}

/**
 * 将路径转换为合法文件名（替换斜杠、反斜杠、冒号等）
 * @param {string} inputPath
 * @returns {string}
 */
function sanitizeFileName(inputPath) {
  return inputPath.replace(/[\\/:\s]/g, "_");
}

/**
 * 统一路径格式：转小写，斜杠和反斜杠都替换为 "/"
 * @param {string} p
 */
function normalizePath(p) {
  return p.replace(/[\\/]+/g, "/").toLowerCase();
}

/**
 * 遍历文件夹，收集所有符合条件的文件
 * @param {string} targetPath
 * @returns {string[]}
 */
function collectFiles(targetPath) {
  /** @type {string[]} */
  const results = [];

  const stat = fs.statSync(targetPath);
  const normPath = normalizePath(targetPath);

  // 路径排除检查
  const isPathExcluded = EXCLUDE_PATHS.some(ex => normPath.includes(normalizePath(ex)));
  if (isPathExcluded) {
    return results; // 直接跳过整个路径
  }

  if (stat.isFile()) {
    const isIncluded = FILE_TYPES.some(ext => normPath.endsWith(ext));
    const isExcluded = EXCLUDE_TYPES.some(ext => normPath.endsWith(ext));

    if (isIncluded && !isExcluded) {
      results.push(targetPath);
    }
  } else if (stat.isDirectory()) {
    const entries = fs.readdirSync(targetPath);
    for (const entry of entries) {
      const fullPath = path.join(targetPath, entry);
      results.push(...collectFiles(fullPath));
    }
  }
  return results;
}

/**
 * 将文件内容整合为 txt
 * @param {string[]} files
 * @returns {string}
 */
function buildOutput(files) {
  let output = "";
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    output += `${file}\n\n${content}\n\n\n`;
  }
  return output;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("请至少提供一个文件或文件夹的绝对路径作为参数");
    process.exit(1);
  }

  /** @type {string[]} */
  let allFiles = [];
  for (const arg of args) {
    const targetPath = path.resolve(arg);
    allFiles.push(...collectFiles(targetPath));
  }

  if (allFiles.length === 0) {
    console.error("没有找到符合条件的文件");
    process.exit(1);
  }

  const timestamp = getTimestampPrefix();
  const baseName = sanitizeFileName(path.resolve(args[0])); // 以第一个路径为准
  const outputFileName = `${timestamp}_${baseName}.txt`;

  const outputContent = (() => {
    const outputContent = buildOutput(allFiles);

    // 【260113】发现有大量<或>时会导致上传失败，将其替换
    // 为避免大量 < 或 > 导致上传失败，将其替换为 URL 安全字符
    // 同时压缩连续空格以减小文件体积
    const safeContent = outputContent
      // .replace(/script>/g, "s_c_r_i_p_t>")
      // .replace(/<script/g, "<s_c_r_i_p_t")
      // .replace(/</g, "&lt;")
      // .replace(/>/g, "&gt;")
      .replace(/</g, "[[LT]]")
      .replace(/>/g, "[[GT]]")
      .replace(/\\/g, "/")
      .replace(/\t/g, " ")
      .replace(/\r\n/g, "\n")
      // .replace(/```/g, "___")
      .replace(/https:\/\//g, "https%3A%2F%2F")
      .replace(/http:\/\//g, "http%3A%2F%2F")
      .replace(/ {2,}/g, " "); // 连续空格压缩为单个空格

    return safeContent;
  })();

  const outputPath = path.join(process.cwd(), "temp", outputFileName);

  // 确保 temp 文件夹存在
  fs.mkdirSync(path.join(process.cwd(), "temp"), { recursive: true });

  fs.writeFileSync(outputPath, outputContent, "utf-8");

  console.log("已处理以下文件：");
  for (const file of allFiles) {
    console.log(" - " + file);
  }

  console.log(`\n已生成文件: ${outputPath}`);
}

main();
