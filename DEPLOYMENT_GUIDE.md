# AI HR Assistant - Deployment Guide

This guide will walk you through deploying your application to the web using Netlify, which provides a generous free tier for hosting static sites and serverless functions.

### Prerequisites

1.  **Git**: You need to have Git installed on your computer.
2.  **GitHub Account**: You will need a free GitHub account.
3.  **Netlify Account**: You will need a free Netlify account.
4.  **Gemini API Key**: Have your Google Gemini API key ready.

---

### Step 1: Set Up Your Code on GitHub

1.  **Create a New Repository**:
    *   Go to [GitHub](https://github.com/new) and create a new, empty repository. You can name it `ai-hr-assistant`. Make it public or private.

2.  **Upload Your Project Files**:
    *   On your local machine, create a folder for your project.
    *   Place all the application files inside this folder, including:
        *   `index.html`
        *   `index.tsx`
        *   `App.tsx`
        *   `metadata.json`
        *   `types.ts`
        *   `constants.ts`
        *   `services/geminiService.ts`
        *   `components/` (directory with all component files)
        *   **`netlify.toml` (the new config file)**
        *   **`netlify/functions/analyze.ts` (the new serverless function)**
    
3.  **Push to GitHub**:
    *   Initialize a Git repository in your project folder, commit the files, and push them to the GitHub repository you just created. You can do this via the command line or using a tool like GitHub Desktop.

    ```bash
    # In your project folder
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

---

### Step 2: Deploy to Netlify

1.  **Connect Netlify to GitHub**:
    *   Log in to your [Netlify account](https://app.netlify.com).
    *   Click on **"Add new site"** and select **"Import an existing project"**.
    *   Choose **"Deploy with GitHub"** and authorize Netlify to access your repositories.

2.  **Select Your Repository**:
    *   Find and select the `ai-hr-assistant` repository you created.

3.  **Configure Build Settings**:
    *   Netlify will automatically detect your `netlify.toml` file and apply the correct settings. You should not need to change anything here.
        *   **Build command** can be left blank.
        *   **Publish directory** should be `/` or `.` (the root).
    *   Click **"Deploy site"**. Netlify will start building and deploying your application.

---

### Step 3: Add Your Secure API Key

This is the most important step to make the app work.

1.  **Go to Site Settings**:
    *   In your new Netlify site's dashboard, go to **"Site configuration"** > **"Build & deploy"** > **"Environment"**.

2.  **Add Environment Variable**:
    *   Click **"Edit variables"**.
    *   Add a new variable with the following details:
        *   **Key**: `API_KEY`
        *   **Value**: Paste your secret Google Gemini API key here.
    *   Click **"Save"**.

3.  **Redeploy to Apply Key**:
    *   Go to the **"Deploys"** tab for your site.
    *   Click the **"Trigger deploy"** dropdown and select **"Deploy site"**. This will start a new deployment that will use your newly saved API key.

---

### Step 4: Access Your Live Application!

Once the final deployment is complete (it should only take a minute), Netlify will show a public URL at the top of your site's dashboard (e.g., `https://your-unique-name.netlify.app`).

**Your AI HR Assistant is now live, secure, and publicly accessible!**
