import {
  fetchImages,
  page,
  perPage,
  incrementPage,
} from './services/fetchImages';
import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let searchQuery = '';

searchForm.addEventListener('submit', onSearchSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreClick);

loadMoreBtn.style.display = 'none';

async function onSearchSubmit(evt) {
  evt.preventDefault();
  clearMarkup();
  const form = evt.currentTarget;
  searchQuery = form.elements.searchQuery.value.trim();
  console.log(searchQuery);

  if (!searchQuery) {
    clearMarkup();
    return Notify.failure('Please, fill the search field');
  }
  try {
    page = 1;
    const res = await fetchImages(searchQuery);
    // console.log(res);
    // console.log(res.data);
    // console.log(res.data.hits);
    // console.log(res.data.totalHits);
    let totalPage = res.data.totalHits;
    if (totalPage === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      clearMarkup();
      return;
    }

    renderMarkup(res.data.hits);
    Notify.success(`Hooray! We found ${totalPage} images.`);
    refreshSimpleLightBox();
    loadMoreBtn.style.display = 'block';
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMoreClick() {
  incrementPage();
  console.log(page);

  try {
    const res = await fetchImages(searchQuery);
    console.log(res.data.hits);
    renderMarkup(res.data.hits);
    refreshSimpleLightBox();
    loadMoreBtn.style.display = 'block';
    // const count = res.data.totalHits / perPage;
    // console.log(count);
    if (res.data.hits.length === 0) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.log(error);
  }
}



function renderMarkup(images) {
  const markup = images
    .map(image => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;

      return `<a href="${largeImageURL}">
        <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>${likes}</b>
          </p>
          <p class="info-item">
            <b>${views}</b>
          </p>
          <p class="info-item">
            <b>${comments}</b>
          </p>
          <p class="info-item">
            <b>${downloads}</b>
          </p>
        </div>
      </div>
    </a>`;
    })
    .join('');
  return gallery.insertAdjacentHTML('beforeend', markup);
}

function clearMarkup() {
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
}


function refreshSimpleLightBox() {
  new SimpleLightbox('.gallery a', {
    // captions: 'true',
    // captionsData: 'alt',
    captionDelay: 250,
    // nav: true,
    // navText: ['←','→'],
  }).refresh();
}


// const { height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: "smooth",
// });