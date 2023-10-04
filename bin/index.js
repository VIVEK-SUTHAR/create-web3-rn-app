#! /usr/bin/env node

import chalk from "chalk";
import { exec } from "child_process";
import * as fs from "fs";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { promisify } from "util";
const execAsync = promisify(exec);

const init = () => {
  console.log(chalk.green.bold("Create Web3 React Native + Expo App"));
  console.log();
  console.log(
    chalk.blue("Bootstrap your your next Web3 Mobile App in seconds")
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
    ]);
    const spinner = ora("Creating your Web3 RN + Expo App...").start();

    const appName = answers.appName;
    const appDesc = answers.appDesc;

    console.log(chalk.blueBright("Settinng up your project.."));
    await execAsync(
      `git clone https://github.com/VIVEK-SUTHAR/cryptoreact.git ${appName}`
    );
    process.chdir(appName);

    const packageJsonPath = "./package.json";
    const packageJsonData = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8")
    );

    packageJsonData.name = appName;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonData, null, 2));

    upadteDetailsInConstants(appName, appDesc);
    updateAppJson(appName);
    await setUpGit(appName);
    console.log(
      chalk.green.bold("Success! Your Web3 React Native app is ready.")
    );
    console.log(
      chalk.white.bold("You can run your app by following below commands ")
    );
    console.log(chalk.white.bold(`Change directory`));
    console.log(chalk.white.bold(`cd ${appName}`));
    console.log(chalk.white.bold(`Install dependencies using npm or yarn`));
    console.log(chalk.white.bold(`yarn`));
    console.log(chalk.white.bold(`and then run yarn start`));

    spinner.stop();
  } catch (error) {
    console.error("Error setting up the project", error);
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
      console.log("Removing existing Git history...");
      fs.rmdirSync(gitDirectory, { recursive: true });
      console.log("Existing Git history removed.");
    }

    await execAsync("git init");
    console.log("Initialized a new Git repository.");
  } catch (error) {
    console.log("Error while initailing new repo", error);
  }
}
