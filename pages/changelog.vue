<template>
  <div class="changelog">
    <h1>Changelog</h1>
    <p>
      Welcome to the AlgoScape changelog. Here, you'll find detailed information
      on the latest updates and enhancements. We encourage you to check back
      regularly to stay informed about new features and improvements.
    </p>

    <h2>Version 0.5.0-alpha</h2>
    <ul>
      <li>
        <strong>Pathfinding Stability Enhanced:</strong> Significantly improved
        the Pathfinding grid's loading process. It now initializes more reliably
        with a loading indicator, resolving previous issues that could cause the
        grid to get stuck in a reloading loop.
      </li>
      <li>
        <strong>DFS Path Now Visible:</strong> Corrected the Depth-First Search
        (DFS) algorithm in Pathfinding to accurately highlight the discovered
        path in green after the destination is found.
      </li>
      <li>
        <strong>Smoother Start/End Node Dragging:</strong> Enhanced the desktop
        experience for moving start and end nodes in the Pathfinding view. They
        now reliably stay where you drop them and cannot be accidentally placed
        on top of each other.
      </li>
      <li>
        <strong>Wall Display Integrity:</strong> Resolved an issue in
        Pathfinding where walls might not have displayed correctly after an
        algorithm was run and the visualization was reset.
      </li>
      <li>
        <strong>Expanded Desktop Grid:</strong> The default grid size for
        desktop users in the Pathfinding view has been increased, offering a
        larger canvas for visualizations.
      </li>
      <li>
        <strong>Sorting View Layout Refined:</strong> Improved the layout and
        responsiveness of the Sorting view, ensuring it better utilizes screen
        space on both desktop and mobile devices.
      </li>
      <li>
        <strong>New Home at algoscape.io:</strong> AlgoScape has a new official
        domain! Site infrastructure has been updated to support
        <code>algoscape.io</code>.
      </li>
    </ul>

    <h2>Version 0.4.0-alpha</h2>
    <ul>
      <li>
        <strong>Feedback Made Easy:</strong> Introduced a new Feedback section
        with an integrated form. Share your thoughts, suggestions, or report any
        bugs directly within the app!
      </li>
      <li>
        <strong>Improved Mobile Experience:</strong> The Pathfinding grid now
        dynamically adjusts to a wider range of mobile screen sizes, aiming for
        a better fit and less scrolling.
      </li>
      <li>
        <strong>Enhanced About Page:</strong> The About page now features
        larger, more readable text for a more comfortable viewing experience.
      </li>
      <li>
        Major CSS overhauls and style consistency improvements across the
        application.
      </li>
    </ul>

    <h2>Version 0.3.0-alpha</h2>
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
        Implemented an adaptive layout for Sorting and Pathfinding controls,
        relocating them to the bottom of the screen on mobile for easier
        one-handed access and keeping them at the top on desktop for
        conventional use.
      </li>
      <li>
        Added new about page with information about the project and the creator.
      </li>
      <li>
        Implemented a new switcher for the main view (Sorting, Pathfinding,
        About).
      </li>
      <li>Enhanced overall button and icon alignment for a cleaner look.</li>
      <li>Many other minor bug fixes and improvements.</li>
    </ul>
    <h2>Version 0.2.1-alpha</h2>
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

    <h2>Version 0.2.0-alpha</h2>
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

    <h2>Version 0.1.0-alpha</h2>
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