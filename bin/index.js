#! /usr/bin/env node

import chalk from "chalk";
import { exec, execSync } from "child_process";
import * as fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { promisify } from "util";
const OLD_ARCH_REPO_URL = "https://github.com/VIVEK-SUTHAR/cryptoreact.git";
const NEW_ARCH_REPO_URL =
  "https://github.com/VIVEK-SUTHAR/cryptoreact-new-architecture.git";

const DEV_BUILDS_DOWNLOAD_URL =
  "https://github.com/VIVEK-SUTHAR/cryptoreact-new-architecture/releases/tag/release";
const execAsync = promisify(exec);

const init = () => {
  console.log(chalk.green.bold("Create Web3 React Native + Expo App"));
  console.log(
    chalk.blue("Bootstrap your your next Web3 Mobile App in seconds :)")
  );
};

async function createWeb3RnApp() {
  try {
    init();
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "appName",
        message: "What's your application name ?",
        default: "super-web3-app",
      },
      {
        type: "input",
        name: "appDesc",
        message: "What describes your app?",
        default: "my cool web3 mobile app",
      },
      {
        type: "confirm",
        name: "isNewArch",
        message:
          "Do you want to use new architecture?,(If you are not sure, select No)",
        default: false,
      },
    ]);
    const networks = await inquirer.prompt([
      {
        type: "checkbox",
        choices: [
          { name: "Ethereum Mainnet", value: "mainnet" },
          { name: "Ethereum Goerli", value: "goerli" },
          { name: "Ethereum Sepolia", value: "sepolia" },
          { name: "Ethereum Holesky", value: "holesky" },
          { name: "Polygon Mainnet", value: "polygon" },
          { name: "Polygon Mumbai", value: "polygonMumbai", checked: true },
          { name: "Polygon zkEVM Testnet", value: "polygonZkEvmTestnet" },
          { name: "Optimism Goerli", value: "optimismGoerli" },
          { name: "Optimism Sepolia", value: "optimismSepolia" },
        ],
        name: "networks",
        message: "Select Networks you want to use",
      },
    ]);
    const spinner = ora("Creating your Web3 RN + Expo App...\n").start();

    const appName = answers.appName;
    const appDesc = answers.appDesc;
    const isNewArch = answers.isNewArch;
    const settingProjectSpinnet = ora("Setting up your project...\n").start();
    if (isNewArch) {
      await execAsync(`git clone ${NEW_ARCH_REPO_URL} ${appName}`);
    } else {
      await execAsync(`git clone ${OLD_ARCH_REPO_URL} ${appName}`);
    }
    process.chdir(appName);

    const packageJsonPath = "./package.json";
    const packageJsonData = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8")
    );

    packageJsonData.name = appName;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonData, null, 2));
    upadteDetailsInConstants(appName, appDesc);
    updateAppJson(appName);
    setupNetworksInWC(networks);
    settingProjectSpinnet.succeed("Project setup completed..\n");
    const installingDependenciesSpinnet = ora(
      "Installing dependencies...\n"
    ).start();

    await execAsync(isYarnInstalled() ? "yarn" : "npm install");
    installingDependenciesSpinnet.succeed("Dependencies installed..\n");
    await setUpGit(appName);
    console.log(
      chalk.green.bold("Success! Your Web3 React Native app is ready.\n")
    );
    printInstrctions(appName, isNewArch);
    spinner.succeed("Your Web3 RN + Expo App is ready.\n");
  } catch (error) {
    console.error("Error setting up the project", error);
    process.exit(1);
  }
}

createWeb3RnApp();

function upadteDetailsInConstants(appName, appDesc) {
  const constantsIndexPath = "./src/constants/index.ts";
  let constantsIndexContent = fs.readFileSync(constantsIndexPath, "utf8");
  constantsIndexContent = constantsIndexContent.replace(
    /export const APP_NAME = "(.*?)"/,
    `export const APP_NAME = "${appName}"`
  );
  constantsIndexContent = constantsIndexContent.replace(
    /export const APP_DESC = "(.*?)"/,
    `export const APP_DESC = "${appDesc}"`
  );

  fs.writeFileSync(constantsIndexPath, constantsIndexContent);
}

function updateAppJson(appName) {
  try {
    const appJsonPath = "./app.json";
    const appJsonData = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

    appJsonData.expo.name = appName;
    appJsonData.expo.slug = appName.toLowerCase().replace(/\s+/g, "-");
    appJsonData.expo.scheme = appName.toLowerCase().replace(/\s+/g, "-");

    fs.writeFileSync(appJsonPath, JSON.stringify(appJsonData, null, 2));
  } catch (error) {}
}

async function setUpGit(appName) {
  try {
    const clonedDirectory = path.join(process.cwd(), appName);
    const gitDirectory = path.join(clonedDirectory, ".git");

    if (fs.existsSync(gitDirectory)) {
      fs.rmdirSync(gitDirectory, { recursive: true });
      console.log("Existing Git history removed.");
    }

    await execAsync("git init");
    console.log("Initialized a new Git repository.");
  } catch (error) {
    console.log("Error while initailing new repo", error);
  }
}

function isYarnInstalled() {
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

function printInstrctions(appName, isNewArch) {
  console.log(chalk.white("To get started, run the following commands:\n"));
  if (isNewArch) {
    console.log(
      chalk.white(
        "- You have opted for New Architecture, So Please Download the Custom Expo Go from below Link.\n"
      )
    );
    console.log(
      chalk.blueBright(`- Download Link: ${DEV_BUILDS_DOWNLOAD_URL}\n`)
    );
    console.log(
      chalk.white("1. Install the App in Simulator or Physical Device\n")
    );
    console.log(chalk.white(`2. Run cd ${appName}\n`));
    console.log(
      chalk.white(`3. ${isYarnInstalled() ? "yarn start" : "npm run start"} \n`)
    );
    console.log(chalk.white(`4. Scan The QR Code and Start Building... \n`));
    return;
  }
  console.log(chalk.white(`1. Run cd ${appName}\n`));
  console.log(
    chalk.white(`2. ${isYarnInstalled() ? "yarn start" : "npm run start"} \n`)
  );
  console.log(
    chalk.white(
      `3. Scan The QR Code with physical device or open simulator and follow instructions... \n`
    )
  );

  console.log(chalk.white("Happy Hacking!"));
}

function setupNetworksInWC(selectedNetworks) {
  if (selectedNetworks.networks.length === 0) {
    selectedNetworks.networks = ["polygonMumbai"];
  }
  const providersFilePath = "./src/providers/WagmiProvider.tsx";
  let providersContent = fs.readFileSync(providersFilePath, "utf-8");

  providersContent = providersContent.replace(
    /const chains = \[.*\];/,
    `const chains = ${JSON.stringify(selectedNetworks.networks)
      .replace(/"/g, "")
      .replace(/'/g, '"')};`
  );
  const updatedImports = `import { ${selectedNetworks.networks.join(
    ","
  )} } from "viem/chains";`;

  providersContent = providersContent.replace(
    /import {[^}]*} from "viem\/chains";/,
    updatedImports
  );

  fs.writeFileSync(providersFilePath, providersContent);

  console.log("Configuration saved to", providersFilePath);
}
