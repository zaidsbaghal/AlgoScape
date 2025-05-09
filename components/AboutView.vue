<template>
  <div class="about-view-container fade-in">
    <div class="about-content">
      <p>Thank you for using AlgoScape!</p>
      <p class="version-number">Version: 0.3.0-alpha</p>

      <p class="built-by-info">
        Built by
        <a
          href="https://www.zaidsbaghal.com"
          target="_blank"
          class="highlighted-link"
        >
          Zaid Baghal
        </a>
        for
        <a
          href="https://www.rawistudios.com"
          target="_blank"
          class="highlighted-link"
        >
          Rawi.
        </a>
      </p>

      <div class="social-icons">
        <a
          href="https://www.instagram.com/zaidsbaghal/"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="fa6-brands:instagram" />
        </a>
        <a
          href="https://www.linkedin.com/in/zaidsbaghal/"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="fa6-brands:linkedin" />
        </a>
        <a
          href="https://github.com/zaidsbaghal"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="fa6-brands:github" />
        </a>
        <a
          href="https://x.com/zaidsbaghal"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="fa6-brands:x-twitter" />
        </a>
        <a
          href="https://www.buymeacoffee.com/zaidsbaghal"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="simple-icons:buymeacoffee" />
        </a>
        <a
          href="https://patreon.com/ZaidSBaghal"
          target="_blank"
          class="icon-wrapper"
        >
          <Icon name="ph:patreon-logo-fill" />
        </a>
      </div>

      <p class="legal-links">© 2025 Rawi Studios. All rights reserved.</p>
      <p class="legal-links">
        <a href="/privacy" class="highlighted-link">Privacy</a>
        <span class="link-separator">|</span>
        <a href="/terms" class="highlighted-link">Terms</a>
        <span class="link-separator">|</span>
        <a href="/changelog" class="highlighted-link">Changelog</a>
      </p>
    </div>
  </div>
</template>

<script setup>
// No script logic needed for this static view
</script>

<style scoped lang="scss">
@use "~/assets/main.scss" as *; // Assuming main.scss is in the root assets folder
@use "sass:color";

.about-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 0;
  box-sizing: border-box;
  height: 75vh;
}

.about-content {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: 100%;
  text-align: center;
  justify-content: center;
  align-items: center;

  p {
    color: $gunmetal;
    line-height: 1.6;
    margin: 0.4rem 0;
    font-size: 1.5rem;
  }

  .version-number {
    font-weight: bold;
    color: $chestnut;
    margin-bottom: 0.8rem;
    font-size: 1.5rem;
  }

  .built-by-info,
  .legal-links {
    font-size: 1.5rem;
    opacity: 0.95;
    color: $gunmetal;
  }

  .built-by-info {
    margin-top: 0.2rem;
    margin-bottom: 0.8rem;
  }

  .social-icons {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .link-separator {
    margin: 0 8px;
  }
}

.social-icons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.icon-wrapper {
  color: $gunmetal;
  transition: color 0.3s, transform 0.2s;
  font-size: 36px;

  &:hover {
    color: $chestnut;
    transform: scale(1.1);
  }
}

.highlighted-link {
  color: inherit;
  text-decoration: underline;
  transition: color 0.3s;

  &:hover {
    color: $chestnut;
  }
}

@media screen and (max-width: 768px) {
  .about-content {
    p {
      font-size: 1rem;
    }

    .version-number {
      font-size: 1.1rem;
    }

    .built-by-info,
    .legal-links {
      font-size: 0.9rem;
    }
  }

  .icon-wrapper {
    font-size: 30px;
  }
}
</style> 