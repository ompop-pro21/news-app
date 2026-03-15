/**
 * DocPress — Google Apps Script Drive Watcher
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Apps Script: https://script.google.com
 * 2. Create a new project, paste this script
 * 3. Go to Project Settings → Script Properties and add:
 *    - GH_TOKEN      : Your GitHub Personal Access Token (repo scope)
 *    - GH_REPO       : e.g. "your-username/your-repo"
 *    - DRIVE_FOLDER_ID: The folder ID from your Drive URL
 * 4. Run initializeState() once manually to set the baseline
 * 5. Add a time-driven trigger: Triggers → Add → checkDriveForChanges → Every 10 minutes
 */

const POLL_INTERVAL_DESCRIPTION = 'Runs every 10 minutes';

/**
 * Initializes the stored state with the current folder snapshot.
 * Run this ONCE manually before setting up the trigger.
 */
function initializeState() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  if (!folderId) {
    throw new Error('Set DRIVE_FOLDER_ID in Script Properties first.');
  }
  const snapshot = getFolderSnapshot(folderId);
  props.setProperty('LAST_SNAPSHOT', JSON.stringify(snapshot));
  Logger.log('State initialized: ' + snapshot.fileCount + ' files, newest: ' + snapshot.newestModified);
}

/**
 * Main polling function. Called by the timed trigger every 10 minutes.
 */
function checkDriveForChanges() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  const ghToken  = props.getProperty('GH_TOKEN');
  const ghRepo   = props.getProperty('GH_REPO');

  if (!folderId || !ghToken || !ghRepo) {
    Logger.log('ERROR: Missing Script Properties. See setup instructions.');
    return;
  }

  const current  = getFolderSnapshot(folderId);
  const lastJson = props.getProperty('LAST_SNAPSHOT');
  const last     = lastJson ? JSON.parse(lastJson) : null;

  const changed =
    !last ||
    current.fileCount     !== last.fileCount ||
    current.newestModified !== last.newestModified;

  if (changed) {
    Logger.log('Change detected! Triggering GitHub Actions...');
    dispatchGitHubEvent(ghToken, ghRepo, 'drive-update', {
      fileCount:     current.fileCount,
      newestModified: current.newestModified,
      triggeredAt:   new Date().toISOString(),
    });
    props.setProperty('LAST_SNAPSHOT', JSON.stringify(current));
  } else {
    Logger.log('No changes detected.');
  }
}

/**
 * Returns a lightweight snapshot of the Drive folder state.
 */
function getFolderSnapshot(folderId) {
  const files = DriveApp.getFolderById(folderId).getFiles();
  let fileCount = 0;
  let newestModified = '1970-01-01T00:00:00.000Z';

  while (files.hasNext()) {
    const file = files.next();
    if (!file.getName().endsWith('.docx')) continue;
    fileCount++;
    const mod = file.getLastUpdated().toISOString();
    if (mod > newestModified) newestModified = mod;
  }

  return { fileCount, newestModified };
}

/**
 * Sends a repository_dispatch event to GitHub Actions.
 */
function dispatchGitHubEvent(token, repo, eventType, payload) {
  const url = 'https://api.github.com/repos/' + repo + '/dispatches';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'token ' + token,
      Accept: 'application/vnd.github.v3+json',
    },
    payload: JSON.stringify({ event_type: eventType, client_payload: payload }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log('GitHub API response: ' + response.getResponseCode() + ' ' + response.getContentText());
}
