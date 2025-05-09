<template>
  <div class="changelog">
    <h1>Changelog</h1>
    <p>
      Welcome to the AlgoScape changelog. Here, you'll find detailed information
      on the latest updates and enhancements. We encourage you to check back
      regularly to stay informed about new features and improvements.
    </p>

    <h2>Version 1.3.0</h2>
    <ul>
      <li>
        Added a "Generate Maze" feature to the Pathfinding view for creating
        random obstacles. Maze generation respects custom start/end node
        locations.
      </li>
      <li>
        Added icons to Generate/Reset buttons in Sorting and Pathfinding views
        for improved clarity.
      </li>
      <li>
        Improved visual feedback when dragging start/end points in Pathfinding
        on desktop: the original position now appears faded during the drag.
      </li>
      <li>
        Fixed an issue where start/end points could not be placed on wall cells
        when using the mobile tap-to-place feature in Pathfinding.
      </li>
      <li>
        Updated button labels in Sorting and Pathfinding views for conciseness
        (e.g., "Merge Sort" is now "Merge", "Depth First" is now "DFS").
      </li>
      <li>
        Optimized mobile UX by relocating control buttons in Sorting and
        Pathfinding views to the bottom of the screen for easier one-handed
        access.
      </li>
      <li>
        Implemented an adaptive layout for Sorting and Pathfinding controls:
        buttons are now at the top on desktop for conventional access and at the
        bottom on mobile for improved ergonomics.
      </li>
      <li>
        Implemented a new switcher for the main view (Sorting, Pathfinding, About).
      </li>
      <li>
        Added new about page with information about the project and the creator.
      </li>
      <li>Enhanced overall button and icon alignment for a cleaner look.</li>
      <li>Many other minor bug fixes and improvements.</li>
    </ul>

    <h2>Version 1.2.1</h2>
    <ul>
      <li>
        Major improvements to Pathfinding on mobile devices:
        <ul>
          <li>
            The pathfinding grid now dynamically adjusts to fit your screen
            perfectly, ensuring a clean look without partial cells or
            unnecessary scrolling.
          </li>
          <li>
            Moving the start and end points is now easier on touchscreens with a
            new "tap-to-select, tap-to-place" interaction.
          </li>
          <li>
            The selected start or end point is now clearly highlighted when
            being moved on mobile.
          </li>
          <li>
            Fixed an issue where the pathfinding grid might not initially use
            the full width on mobile.
          </li>
          <li>
            Resolved a visual bug that could make extra start/end points briefly
            appear on mobile.
          </li>
        </ul>
      </li>
      <li>
        Enhanced the reliability and smoothness of pathfinding algorithm
        visualizations.
      </li>
      <li>Improved stability of the Pathfinding visualization component.</li>
      <li>
        Fixed an issue on mobile (especially Safari) where tapping buttons in
        the Sorting view could cause the page to zoom unintentionally.
      </li>
      <li>
        Fine-tuned spacing for the copyright notice on mobile for a cleaner
        appearance.
      </li>
      <li>
        Ensured the application consistently uses the full screen height on
        mobile devices for a more immersive experience.
      </li>
    </ul>

    <h2>Version 1.2.0</h2>
    <ul>
      <li>
        Major revamp of the mobile view for full responsiveness and usability
        across all devices.
      </li>
      <li>
        Implemented significant code quality improvements and refactoring for
        better maintainability and performance.
      </li>
      <li>Added a new site logo for improved branding.</li>
      <li>
        Optimized font loading strategy for faster initial page load and
        rendering.
      </li>
    </ul>

    <h2>Version 1.1.0</h2>
    <ul>
      <li>
        Updated to Nuxt 3.17; improvements can be read about
        <a href="https://nuxt.com/blog/v3-17" target="_blank">here</a>.
      </li>
    </ul>

    <h2>1.0.0</h2>
    <ul>
      <li>Official release of AlgoScape with full functionality.</li>
      <li>
        Implemented interactive visualizations for sorting algorithms: Merge
        Sort, Quick Sort, Bubble Sort, Selection Sort, and Insertion Sort.
      </li>
      <li>
        Added pathfinding algorithms: Depth-First Search, Breadth-First Search,
        Dijkstra's Shortest Path, and A* Search.
      </li>
      <li>Enhanced user interface with responsive design for desktop use.</li>
      <li>Integrated feedback system for user suggestions.</li>
      <li>Optimized performance for smooth animations and transitions.</li>
    </ul>
  </div>
</template>

<script setup>
</script>

<style scoped>
.changelog {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.changelog h1 {
  margin-bottom: 20px;
}
</style> 