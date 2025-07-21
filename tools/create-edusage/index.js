#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const which = require('which');
const semver = require('semver');
const mustache = require('mustache');

// Version and description
const packageJson = require('./package.json');

// Banner display
const displayBanner = () => {
    console.log(chalk.cyan(`
  ███████╗██████╗ ██╗   ██╗███████╗ █████╗  ██████╗ ███████╗
  ██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗██╔════╝ ██╔════╝
  █████╗  ██║  ██║██║   ██║███████╗███████║██║  ███╗█████╗  
  ██╔══╝  ██║  ██║██║   ██║╚════██║██╔══██║██║   ██║██╔══╝  
  ███████╗██████╔╝╚██████╔╝███████║██║  ██║╚██████╔╝███████╗
  ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                                                            
  `));
    console.log(chalk.cyan(`  Create EduΣage App v${packageJson.version}`));
    console.log(chalk.cyan('  The ultimate learning platform scaffold\n'));
};

// Check system requirements
const checkSystemRequirements = async () => {
    const spinner = ora('Checking system requirements...').start();

    try {
        // Check Node.js version
        const nodeVersion = process.version;
        if (semver.lt(nodeVersion, '16.0.0')) {
            spinner.fail(`Node.js version ${nodeVersion} is not supported. Please use Node.js 16.0.0 or higher.`);
            process.exit(1);
        }

        // Check if Git is installed
        try {
            which.sync('git');
        } catch (err) {
            spinner.fail('Git is not installed. Please install Git and try again.');
            process.exit(1);
        }

        spinner.succeed('System requirements met!');
        return true;
    } catch (error) {
        spinner.fail(`Failed to check system requirements: ${error.message}`);
        process.exit(1);
    }
};

// Create project directory
const createProjectDirectory = async (projectName) => {
    const spinner = ora(`Creating project directory: ${projectName}`).start();

    try {
        const projectPath = path.resolve(process.cwd(), projectName);

        // Check if directory exists
        if (fs.existsSync(projectPath)) {
            spinner.fail(`Directory ${projectName} already exists. Please choose a different name or delete the existing directory.`);
            process.exit(1);
        }

        // Create directory
        fs.mkdirSync(projectPath, { recursive: true });

        spinner.succeed(`Project directory created: ${projectName}`);
        return projectPath;
    } catch (error) {
        spinner.fail(`Failed to create project directory: ${error.message}`);
        process.exit(1);
    }
};

// Copy template files
const copyTemplateFiles = async (projectPath, templateName = 'default') => {
    const spinner = ora('Copying template files...').start();

    try {
        const templatePath = path.resolve(__dirname, 'templates', templateName);

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            spinner.fail(`Template ${templateName} not found.`);
            process.exit(1);
        }

        // Copy template files
        await fs.copy(templatePath, projectPath);

        spinner.succeed('Template files copied successfully!');
    } catch (error) {
        spinner.fail(`Failed to copy template files: ${error.message}`);
        process.exit(1);
    }
};

// Install dependencies
const installDependencies = async (projectPath, packageManager = 'pnpm') => {
    const spinner = ora('Installing dependencies...').start();

    try {
        // Check if package manager is installed
        try {
            which.sync(packageManager);
        } catch (err) {
            if (packageManager === 'pnpm') {
                spinner.info('pnpm not found. Installing pnpm...');
                execSync('npm install -g pnpm', { stdio: 'inherit' });
            } else {
                spinner.fail(`Package manager ${packageManager} not found. Please install it and try again.`);
                process.exit(1);
            }
        }

        // Change directory and install dependencies
        process.chdir(projectPath);
        execSync(`${packageManager} install`, { stdio: 'inherit' });

        spinner.succeed('Dependencies installed successfully!');
    } catch (error) {
        spinner.fail(`Failed to install dependencies: ${error.message}`);
        process.exit(1);
    }
};

// Initialize Git repository
const initializeGit = async (projectPath) => {
    const spinner = ora('Initializing Git repository...').start();

    try {
        process.chdir(projectPath);
        execSync('git init', { stdio: 'ignore' });
        execSync('git add .', { stdio: 'ignore' });
        execSync('git commit -m "Initial commit from create-edusage"', { stdio: 'ignore' });

        spinner.succeed('Git repository initialized successfully!');
    } catch (error) {
        spinner.warn(`Failed to initialize Git repository: ${error.message}`);
    }
};

// Setup Supabase
const setupSupabase = async (projectPath) => {
    const spinner = ora('Setting up Supabase...').start();

    try {
        process.chdir(projectPath);

        // Check if Supabase CLI is installed
        try {
            which.sync('supabase');
        } catch (err) {
            spinner.info('Supabase CLI not found. Installing Supabase CLI...');
            execSync('npm install -g supabase', { stdio: 'inherit' });
        }

        // Initialize Supabase
        execSync('supabase init', { stdio: 'ignore' });

        spinner.succeed('Supabase setup completed successfully!');
    } catch (error) {
        spinner.warn(`Failed to setup Supabase: ${error.message}. You can set it up manually later.`);
    }
};

// Configure project
const configureProject = async (projectPath, projectName, options) => {
    const spinner = ora('Configuring project...').start();

    try {
        // Read package.json
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = require(packageJsonPath);

        // Update package.json
        packageJson.name = projectName;

        // Write updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Create .env file from .env.example
        const envExamplePath = path.join(projectPath, '.env.example');
        const envPath = path.join(projectPath, '.env');

        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
        }

        spinner.succeed('Project configured successfully!');
    } catch (error) {
        spinner.fail(`Failed to configure project: ${error.message}`);
    }
};

// Run setup script
const runSetupScript = async (projectPath) => {
    const spinner = ora('Running setup script...').start();

    try {
        process.chdir(projectPath);
        execSync('pnpm setup', { stdio: 'inherit' });

        spinner.succeed('Setup script completed successfully!');
    } catch (error) {
        spinner.warn(`Failed to run setup script: ${error.message}. You can run it manually later with 'pnpm setup'.`);
    }
};

// Display next steps
const displayNextSteps = (projectName) => {
    console.log(chalk.green('\n✨ Project created successfully! ✨\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(`  cd ${projectName}`);
    console.log('  pnpm dev');
    console.log('\nTo learn more about EduΣage, check out the documentation:');
    console.log(chalk.cyan('  https://docs.edusage.ai\n'));
};

// Main function
const createEdusage = async (projectName, options) => {
    displayBanner();

    await checkSystemRequirements();

    // If no project name is provided, prompt for it
    if (!projectName) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'What is the name of your project?',
                default: 'my-edusage-app',
                validate: (input) => {
                    if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
                    return 'Project name may only include letters, numbers, underscores and hashes.';
                }
            }
        ]);

        projectName = answers.projectName;
    }

    // Create project directory
    const projectPath = await createProjectDirectory(projectName);

    // Copy template files
    await copyTemplateFiles(projectPath, options.template);

    // Install dependencies
    await installDependencies(projectPath, options.packageManager);

    // Initialize Git repository
    await initializeGit(projectPath);

    // Configure project
    await configureProject(projectPath, projectName, options);

    // Setup Supabase
    await setupSupabase(projectPath);

    // Run setup script
    await runSetupScript(projectPath);

    // Display next steps
    displayNextSteps(projectName);
};

// CLI configuration
program
    .name('create-edusage')
    .description('Create a new EduΣage learning platform project')
    .version(packageJson.version)
    .argument('[project-name]', 'Name of the project')
    .option('-t, --template <name>', 'Template to use', 'default')
    .option('-p, --package-manager <name>', 'Package manager to use', 'pnpm')
    .action((projectName, options) => {
        createEdusage(projectName, options).catch((error) => {
            console.error(chalk.red(`Error: ${error.message}`));
            process.exit(1);
        });
    });

program.parse(process.argv);