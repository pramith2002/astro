document.addEventListener("DOMContentLoaded", () => {
  const lazyImages = document.querySelectorAll("img.lazy");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          obs.unobserve(img);
        }
      });
    },
    {
      root: null, 
      rootMargin: "0px 0px 50px 0px", 
      threshold: 0.1,
    }
  );

  lazyImages.forEach((img) => observer.observe(img));
});
