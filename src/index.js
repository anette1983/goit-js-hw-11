import {
  fetchImages,
  page,
  incrementPage,
  resetPage,
  findCount,
  perPage,
} from './services/fetchImages';
import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';

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
    resetPage();
    const res = await fetchImages(searchQuery);
    // console.log(res);
    // console.log(res.data);
    // console.log(res.data.hits);
    // console.log(res.data.totalHits);
    const totalPage = res.data.totalHits;
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
    loadMoreBtn.style.display = 'inline-block';
    if (res.data.hits.length < 40) {
      onCollectionEnd();
    }
    
  } catch (error) {
    console.log(error);
    Notify.failure('Something went wrong!');
  }
  searchForm.reset();
}

async function onLoadMoreClick() {
  incrementPage();
  console.log(page);

  try {
    const res = await fetchImages(searchQuery);
    console.log(res.data.hits);
    renderMarkup(res.data.hits);
    refreshSimpleLightBox();
    loadMoreBtn.style.display = 'inline-block';
    onScroll();
    // let infiniteScroll = new InfiniteScroll( gallery, {

    //   path: '.pagination__next',
    //   append: '.post',
    //   history: false,
    // });

    if (res.data.hits.length < 40) {
      onCollectionEnd();
    }
  } catch (error) {
    console.log(error.response.status);
    if ((error.response.status = 400)) {
      onCollectionEnd();
    } else {
      console.log(error);
      console.dir(error);
      Notify.failure('Something went wrong!');
    }
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

      return `<a class="gallery__item" href="${largeImageURL}">
        <div class="photo-card">
        <img class="gallery__image" src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes</b>${likes}</p>
          <p class="info-item"><b>Views</b>${views}</p>
          <p class="info-item"><b>Comments</b>${comments}</p>
          <p class="info-item"><b>Downloads</b>${downloads}</p>
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

function onCollectionEnd() {
  Notify.info("We're sorry, but you've reached the end of search results.", {
    showOnlyTheLastOne: true,
    cssAnimationDuration: 1000,
  });
  loadMoreBtn.style.display = 'none';
}

function onScroll() {
  const { height: cardHeight} = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
