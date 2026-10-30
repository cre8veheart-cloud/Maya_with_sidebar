export type Artwork = {
  id: string;
  title: string;
  artist: string;
  medium: string;
  dimensions: string;
  year: string;
  price: string;
  status: "available" | "reserved" | "sold";
  image: string;
  onWebsite: boolean;
};

export type GalleryDraft = {
  version: 1;
  website: {
    name: string;
    headline: string;
    about: string;
    email: string;
    theme: "ivory" | "ink";
    showLogo: boolean;
  };
  artworks: Artwork[];
};
