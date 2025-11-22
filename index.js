/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if(e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing')

    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }

}

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing')

  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

window.addEventListener('keydown', handleFirstTab)

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

let alterStyles = (isBackToTopRendered) => {
  backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
  backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
  backToTopButton.style.transform = isBackToTopRendered
    ? "scale(1)"
    : "scale(0)";
};

window.addEventListener("scroll", () => {
  if (window.scrollY > 700) {
    isBackToTopRendered = true;
    alterStyles(isBackToTopRendered);
  } else {
    isBackToTopRendered = false;
    alterStyles(isBackToTopRendered);
  }
});

/* -----------------------------------------
  Load latest GitHub repositories
 ---------------------------------------- */

const latestReposContainer = document.querySelector("#latest-repos");
const githubUser = "kemalsanli";
const latestReposEndpoint = `https://api.github.com/users/${githubUser}/repos?sort=created&direction=desc&per_page=6`;

const renderRepo = (repo, languages) => {
  const workBox = document.createElement("div");
  workBox.className = "work__box";

  const text = document.createElement("div");
  text.className = "work__text";

  const title = document.createElement("h3");
  title.textContent = repo.name;

  const description = document.createElement("p");
  description.textContent = repo.description || "No description provided.";

  const list = document.createElement("ul");
  list.className = "work__list";
  const langs = languages && languages.length ? languages : [repo.language || "Other"];
  langs.forEach((lang) => {
    const languageItem = document.createElement("li");
    languageItem.textContent = lang;
    list.appendChild(languageItem);
  });

  const links = document.createElement("div");
  links.className = "work__links";
  const repoLink = document.createElement("a");
  repoLink.href = repo.html_url;
  repoLink.className = "link__text";
  repoLink.textContent = "Visit Repo ";
  const arrow = document.createElement("span");
  arrow.textContent = "\u2192";
  repoLink.appendChild(arrow);
  links.appendChild(repoLink);

  const githubIcon = document.createElement("a");
  githubIcon.href = repo.html_url;
  githubIcon.title = "View on GitHub";
  const githubImg = document.createElement("img");
  githubImg.src = "./images/github.svg";
  githubImg.className = "work__code";
  githubImg.alt = "GitHub";
  githubIcon.appendChild(githubImg);
  links.appendChild(githubIcon);

  text.appendChild(title);
  text.appendChild(description);
  text.appendChild(list);
  text.appendChild(links);

  workBox.appendChild(text);

  const imageBox = document.createElement("div");
  imageBox.className = "work__image-box";
  const siteImage = document.createElement("img");
  siteImage.className = "work__image";
  siteImage.alt = `${repo.name} preview`;
  const defaultBranch = repo.default_branch || "main";
  siteImage.src = `https://raw.githubusercontent.com/${githubUser}/${repo.name}/${defaultBranch}/SiteImage.png`;
  siteImage.onerror = () => {
    workBox.classList.add("work__box--no-image");
    imageBox.remove();
  };
  imageBox.appendChild(siteImage);
  workBox.appendChild(imageBox);

  latestReposContainer.appendChild(workBox);
};

const loadLatestRepos = async () => {
  if (!latestReposContainer) {
    return;
  }

  latestReposContainer.textContent = "Loading latest repositories...";

  try {
    const response = await fetch(latestReposEndpoint);

    if (!response.ok) {
      throw new Error("GitHub API request failed");
    }

    const repos = await response.json();
    latestReposContainer.textContent = "";

    const repoLanguages = await Promise.all(
      repos.map(async (repo) => {
        try {
          const res = await fetch(repo.languages_url);
          if (!res.ok) throw new Error("languages fetch failed");
          const langs = await res.json();
          return Object.keys(langs);
        } catch (err) {
          console.error(err);
          return [];
        }
      })
    );

    repos.forEach((repo, index) => renderRepo(repo, repoLanguages[index]));
  } catch (error) {
    latestReposContainer.textContent = "Unable to load repositories right now.";
    console.error(error);
  }
};

loadLatestRepos();

/* -----------------------------------------
  Load Medium blog posts (from generated JSON)
 ---------------------------------------- */

const blogListContainer = document.querySelector("#blog-list");
const mediumFeedPath = "./data/medium.json";

const renderBlogPost = (post) => {
  const workBox = document.createElement("div");
  workBox.className = "work__box";

  const text = document.createElement("div");
  text.className = "work__text";

  const title = document.createElement("h3");
  title.textContent = post.title || "Untitled post";

  const description = document.createElement("p");
  description.innerHTML = post.description
    ? post.description.replace(/<[^>]+>/g, "").slice(0, 180) + "..."
    : "";

  const list = document.createElement("ul");
  list.className = "work__list";
  const dateItem = document.createElement("li");
  dateItem.textContent = post.published ? new Date(post.published).toLocaleDateString() : "Medium";
  list.appendChild(dateItem);

  const links = document.createElement("div");
  links.className = "work__links";
  const blogLink = document.createElement("a");
  blogLink.href = post.link;
  blogLink.className = "link__text";
  blogLink.textContent = "Visit Blog ";
  const arrow = document.createElement("span");
  arrow.textContent = "\u2192";
  blogLink.appendChild(arrow);
  links.appendChild(blogLink);

  text.appendChild(title);
  text.appendChild(description);
  text.appendChild(list);
  text.appendChild(links);

  workBox.appendChild(text);

  if (post.thumbnail) {
    const imageBox = document.createElement("div");
    imageBox.className = "work__image-box";
    const img = document.createElement("img");
    img.className = "work__image";
    img.alt = post.title || "Medium post";
    img.src = post.thumbnail;
    img.onerror = () => {
      workBox.classList.add("work__box--no-image");
      imageBox.remove();
    };
    imageBox.appendChild(img);
    workBox.appendChild(imageBox);
  } else {
    workBox.classList.add("work__box--no-image");
  }

  blogListContainer.appendChild(workBox);
};

const loadBlogPosts = async () => {
  if (!blogListContainer) return;

  blogListContainer.textContent = "Loading blog posts...";

  try {
    const response = await fetch(mediumFeedPath + "?cache-bust=" + Date.now());
    if (!response.ok) throw new Error("Failed to load Medium feed");
    const data = await response.json();
    const posts = data.posts || [];

    blogListContainer.textContent = "";
    posts.forEach(renderBlogPost);

    if (!posts.length) {
      blogListContainer.textContent = "No blog posts found.";
    }
  } catch (error) {
    blogListContainer.textContent = "Unable to load blog posts right now.";
    console.error(error);
  }
};

loadBlogPosts();
