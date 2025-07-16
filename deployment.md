# Deployment Instructions

Follow these steps to deploy the Google Apps Script and connect it to your Google Form.

## 1. Create a new Google Apps Script project

1.  Go to the Google Apps Script dashboard: [https://script.google.com/home](https://script.google.com/home)
2.  Click on "New project".
3.  Give your project a name (e.g., "Form Submission Processor").

## 2. Add the script files

1.  In the script editor, you will see a default `Code.gs` file. Rename it to `main.gs`.
2.  Copy the contents of the `main.gs` file from this repository and paste it into the `main.gs` file in the script editor.
3.  Click on the "+" icon next to "Files" in the left-hand sidebar and select "Script".
4.  Name the new file `test.gs`.
5.  Copy the contents of the `test.gs` file from this repository and paste it into the `test.gs` file in the script editor.

## 3. Configure the script for your Google Form

1.  Open the Google Form that you want to connect the script to.
2.  Click on the "Script editor" from the three-dots menu in the top right. This will open a new Apps Script project that is bound to the form.
3.  Copy the code from the `main.gs` and `test.gs` files you created in the previous step into this new project, following the same file structure.

## 4. Set up the trigger

1.  In the Apps Script editor bound to your form, click on the "Triggers" icon (it looks like a clock) in the left-hand sidebar.
2.  Click on the "Add Trigger" button in the bottom right.
3.  In the "Choose which function to run" dropdown, select `onFormSubmit`.
4.  In the "Choose which deployment should run" dropdown, select `Head`.
5.  In the "Select event source" dropdown, select `From form`.
6.  In the "Select event type" dropdown, select `On form submit`.
7.  Click "Save".

## 5. Authorize the script

1.  When you save the trigger, Google will ask you to authorize the script.
2.  Follow the on-screen instructions to grant the necessary permissions. You may see a warning that the app is not verified; you can proceed by clicking on "Advanced" and then "Go to (your project name)".

## 6. Test the script

1.  To test the script with mock data, open the `test.gs` file in the script editor.
2.  Select the `testOnFormSubmit` function from the dropdown at the top of the editor.
3.  Click the "Run" button.
4.  Check the inbox of the test email address ("test@example.com") to see if the email was generated correctly.
5.  You can also check the execution logs in the Apps Script editor for any errors.

Your script is now deployed and will automatically run every time a user submits your Google Form.
