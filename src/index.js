import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
loadMore.addEventListener('click', onLoad);

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38409790-9d6abd70194af5cc66bb0293b';
searchForm.addEventListener('submit', onSubmit);
let lightbox;
function initializeLightbox() {
  lightbox = new SimpleLightbox('.gallery a');
}
let searchQuery = '';

async function getPhotos(page = 1) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
 <a href="${largeImageURL}"> <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300px" height="250" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');
}
totalHits = 0;
async function fetchPhotos(page = 1) {
  try {
    const data = await getPhotos(page);
    totalHits += data.totalHits;
    // Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    if (data.hits.length === 0) {
      loadMore.hidden = true;
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

      if (data.page !== data.totalHits) {
        loadMore.hidden = false;
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      }
      if (currentPage >= data.totalHits / 40) {
        loadMore.hidden = true;

        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }

      initializeLightbox();
      lightbox.refresh();
    }
  } catch (error) {
    console.log(error);
  }
}
async function onSubmit(event) {
  event.preventDefault();

  searchQuery = event.target.elements.searchQuery.value;
  // console.log(searchQuery);

  clearForm();
  clearGalaryContainer();
  // onLoad();
  await fetchPhotos();
  currentPage = 1;
}

function clearForm() {
  searchForm.reset();
}
function clearGalaryContainer() {
  gallery.innerHTML = '';
}

let currentPage = 1;

async function onLoad() {
  try {
    currentPage += 1;

    await fetchPhotos(currentPage);

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.log(error);
  }
}
