(() => {
  const carousel = document.querySelector("#burgerCarousel");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".carouselSlide"));
  const dots = Array.from(carousel.querySelectorAll(".carouselDot"));
  const prevButton = carousel.querySelector(".carouselControl.prev");
  const nextButton = carousel.querySelector(".carouselControl.next");

  if (!slides.length) return;

  let currentIndex = 0;

  function setActiveSlide(nextIndex) {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    currentIndex = normalizedIndex;

    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === normalizedIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === normalizedIndex);
      dot.setAttribute("aria-selected", String(index === normalizedIndex));
    });
  }

  prevButton?.addEventListener("click", () => setActiveSlide(currentIndex - 1));
  nextButton?.addEventListener("click", () => setActiveSlide(currentIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const { slide } = dot.dataset;
      if (!slide) return;
      setActiveSlide(Number(slide));
    });
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveSlide(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveSlide(currentIndex + 1);
    }
  });

  setActiveSlide(0);
})();
