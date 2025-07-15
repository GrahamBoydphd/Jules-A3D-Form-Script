# Deployment Instructions

Follow these steps to deploy the Google Forms analysis script:

## 1. Create a new Google Apps Script Project

1.  Open your Google Form.
2.  Click on the "More" icon (three vertical dots) in the top-right corner and select "Script editor". This will open a new Google Apps Script project.

## 2. Copy the Code

1.  Copy the code from `main.gs` and paste it into the `Code.gs` file in the Google Apps Script editor.
2.  Create a new script file by clicking on "File" -> "New" -> "Script file". Name it `test.gs`.
3.  Copy the code from `test.gs` and paste it into the newly created `test.gs` file in the Google Apps Script editor.

## 3. Set up the Trigger

1.  In the Google Apps Script editor, click on the "Triggers" icon (a clock) in the left-hand menu.
2.  Click on the "Add Trigger" button in the bottom-right corner.
3.  Configure the trigger as follows:
    *   **Choose which function to run**: `onFormSubmit`
    *   **Choose which deployment should run**: `Head`
    *   **Select event source**: `From form`
    *   **Select event type**: `On form submit`
4.  Click "Save".

## 4. Authorize the Script

1.  The first time you run the script or set up the trigger, Google will ask you to authorize the script to access your data.
2.  Follow the on-screen instructions to grant the necessary permissions.

## 5. Testing

1.  To test your script, you can either submit a form or run the `testAnalysis` function manually from the script editor.
2.  To run `testAnalysis`, select the function from the dropdown menu at the top of the script editor and click the "Run" button.
3.  View the logs by clicking on the "Execution log" icon (a list) in the left-hand menu.

## 6. Further Actions

This script is designed to be extensible. You can add more functions to `main.gs` to perform other actions, such as:

*   Storing the analysis results in a Google Sheet.
*   Sending notifications to a Slack channel.
*   Integrating with other services via APIs.

To add a new action, simply create a new function and call it from the `onFormSubmit` function.
