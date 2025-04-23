import { searchListener } from "./results.js";

searchListener("html/");

async function loadHomepage() {
  try {
    const response = await fetch("./html/homepage.html");
    const html = await response.text();
    document.getElementById("content").innerHTML = html;

    const homepageModule = await import("./homepage.js");
    homepageModule.initHomepage();
  } catch (error) {
    console.error("Error loading homepage:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadHomepage);
