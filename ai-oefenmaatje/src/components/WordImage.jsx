export default function WordImage({ word, image, alt }) {
  if (!image) return null;

  return (
    <figure className="word-image">
      <img
        src={image}
        alt={alt || `Plaatje bij het woord ${word}`}
        className="word-image__img"
        loading="lazy"
      />
    </figure>
  );
}
