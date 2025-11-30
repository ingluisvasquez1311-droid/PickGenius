@echo off
echo Initializing git... > deploy.log
git init >> deploy.log 2>&1
echo Adding remote... >> deploy.log
git remote remove origin >> deploy.log 2>&1
git remote add origin https://github.com/ingluisvasquez1311-droid/PickGenius >> deploy.log 2>&1
echo Adding files... >> deploy.log
git add . >> deploy.log 2>&1
echo Committing... >> deploy.log
git commit -m "feat: prepare for production deployment" >> deploy.log 2>&1
echo Renaming branch... >> deploy.log
git branch -M main >> deploy.log 2>&1
echo Pushing... >> deploy.log
git push -u origin main >> deploy.log 2>&1
echo Done. >> deploy.log
