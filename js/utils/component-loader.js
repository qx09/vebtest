/**
 * Component Loader
 * Recursively fetches HTML modules based on the `data-include` attribute
 * and replaces the placeholder element with the fetched HTML.
 */
export async function loadComponents(container = document) {
  const elements = container.querySelectorAll('[data-include]');

  // We use Promise.all to load components in parallel for speed
  const loadPromises = Array.from(elements).map(async (el) => {
    const file = el.getAttribute('data-include');
    try {
      // Small fix: Ensure paths behave well locally by removing leading slash if needed, 
      // though http-server usually handles absolute paths fine.
      let url = file.startsWith('/') ? file : `/${file}`;
      // Force cache bypassing during active development
      url = `${url}?t=${Date.now()}`;
      const response = await fetch(url);
      if (response.ok) {
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Execute any script tags inside the fetched HTML
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          if (oldScript.innerHTML) {
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          }
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });

        // Recursively load any nested components before replacing
        await loadComponents(tempDiv);

        // Replace the placeholder element completely
        const nodes = Array.from(tempDiv.childNodes);
        el.replaceWith(...nodes);
      } else {
        console.error(`Component not found: ${file}`);
        el.innerHTML = `<div class="error">Failed to load: ${file}</div>`;
      }
    } catch (error) {
      console.error(`Error loading component from ${file}:`, error);
      el.innerHTML = `<div class="error">Error loading: ${file}</div>`;
    }
  });

  await Promise.all(loadPromises);
}
