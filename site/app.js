const repository = "darmolian/ready-instrument-one";
const releasesUrl = `https://api.github.com/repos/${repository}/releases?per_page=10`;

const byId = (id) => document.getElementById(id);

function findAsset(release, pattern) {
  return release.assets.find((asset) => pattern.test(asset.name));
}

function showRelease(release) {
  const installer = findAsset(release, /Setup\.exe$/i);

  if (!installer) {
    return;
  }

  const checksum = findAsset(release, /SHA256\.txt$/i);
  const button = byId("download-button");

  byId("release-kicker").textContent = release.prerelease ? "Early access release" : "Current release";
  byId("release-title").textContent = release.name || release.tag_name;
  byId("release-description").textContent = "The Windows installer is ready. Please read the beta note below before downloading.";
  byId("release-version").textContent = release.tag_name;
  byId("release-light").classList.add("available");

  button.textContent = "Download for Windows";
  button.href = installer.browser_download_url;
  button.classList.remove("disabled");
  button.removeAttribute("aria-disabled");

  if (checksum) {
    byId("checksum-link").href = checksum.browser_download_url;
  } else {
    byId("checksum-link").hidden = true;
  }

  byId("notes-link").href = release.html_url;

  byId("release-details").hidden = false;
}

async function loadLatestRelease() {
  try {
    const response = await fetch(releasesUrl, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      return;
    }

    const releases = await response.json();
    const release = releases.find((item) => !item.draft);

    if (release) {
      showRelease(release);
    }
  } catch {
    // The static preparing state remains usable if GitHub's API is unavailable.
  }
}

byId("year").textContent = new Date().getFullYear();
loadLatestRelease();
