import { refs } from './refs';
import handleMovieCard from './handleMovieCard';
import filmCard from '../templates/preview_card.hbs';
import { apiSearchData, popularMovie } from './search';
import { yearValue, genreValue, sortValue, movieFilter } from './filter';
import createCard from './filter';
import FilmsStorage from './local-storage';

const filmsStorage = new FilmsStorage();

let globalTotalPages = 0;
let globalPage = 0;

// создание и добавление разметки пагинации в DOM
function onRenderPagination(totalPages, page) {
  
  let paginationMarkup = '';  
  let activePage = '';  
  let beforePage = page - 1;  
  let afterPage = page + 1; 
  
  if (page > 1) { // добавление кнопки "Prev" 
    paginationMarkup += `
    <li class="pagination__item pagination__item--prev">&laquo;</li>`;
  };
  
  if(page > 2) { // добавление кнопки " 1 "
    paginationMarkup += `
    <li class="pagination__item pagination__item--numb-first">1</li>`;

    if(page > 3) { // добавление "..."
      paginationMarkup += `
      <li class="pagination__item pagination__item--dots">...</li>`;
    }
  }

    // сколько страниц или li отображается до текущей "current" li
  if (totalPages === 0) {
    refs.paginationEl.classList.add('pagination__off');
    return;
  }
  refs.paginationEl.classList.remove('pagination__off')
  
  if (totalPages === 1) {
    beforePage === 0;
  } else if (page === totalPages) {
    beforePage -= 2;
  } else if (page === totalPages - 1) {
    beforePage -= 1;
  } 

    // сколько страниц или li отображается после текущей "current" li  
  if (page === 1) {    
    afterPage = afterPage + 2;
  } else if (page === 2) {    
    afterPage += 1;
  }

  for (let pageLength = beforePage; pageLength <= afterPage; pageLength += 1) {
    //   //console.log('pageLength', pageLength, '===', 'page', page);
    if (pageLength > totalPages) { //если pageLength больше totalPage, то continue
      continue;
    }

    if (pageLength == 0) { //если pageLength = 0 то приплюсовать +1 к pageLength
      pageLength += 1;
    }

    if (page === pageLength) { //если page равен pageLength то в переменную activePage записать строку 'pagination__item--active'
      activePage = 'pagination__item--active';      
    } else {  //иначе переменную activePage оставляем пустой
      activePage = '';        
    }
    paginationMarkup += `
      <li class="pagination__item pagination__item--numb ${activePage}">${pageLength}</li>`;
  }

  if(page < totalPages - 1){ //если значение page меньше чем значение (totalPage -1) то показываем последний li или page
    if(page < totalPages - 2){ //если значение page меньше чем значение (totalPage -2) то добавляем "..." перед последним li или page
      paginationMarkup += `
        <li class="pagination__item pagination__item--dots">...</li>`;
    }
    paginationMarkup += `
      <li class="pagination__item pagination__item--numb-last">${totalPages}</li>`;
  }
    
  if (page < totalPages) { //показываем кнопку "Next" если значение pageменьше чем totalPage
    paginationMarkup += `
      <li class="pagination__item pagination__item--next">&raquo;</li>`;    
  };

  globalTotalPages = totalPages;
  globalPage = page;
  
  refs.paginationEl.innerHTML = paginationMarkup;  
};

// добавление слушателя на элемент <ul class="pagination">
refs.paginationEl.addEventListener('click', onPaginationBtnClick);

// отслеживание клика по кнопкам пагинации и отработка пагинации
function onPaginationBtnClick(event) {

  // фильтрация валидного event.target  
  if (event.target.nodeName !== 'LI') {
    return;
  }
  
  else {    
    const listenerTarget = event.target.closest('li').textContent;

    window.scroll({
      top: 0,
      behavior: 'smooth'
    });
      
    switch (listenerTarget) {
      case '«':
        onRenderMarkupByPagination(globalPage - 1);
        onRenderPagination(globalTotalPages, globalPage - 1);
        break;

      case '»':
        onRenderMarkupByPagination(globalPage + 1);
        onRenderPagination(globalTotalPages, globalPage + 1);
        break;
    
      case '1':
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, 1);
        break;
    
      case String(globalPage - 1):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage - 1);
        break;

      case String(globalPage - 2):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage - 2);
        break;
    
      case String(globalPage - 3):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage - 3);
        break;

      case String(globalPage + 1):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage + 1);
        break;
    
      case String(globalPage + 2):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage + 2);
        break;

      case String(globalPage + 3):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalPage + 3);
        break;
    
      case String(globalTotalPages):
        onRenderMarkupByPagination(listenerTarget);
        onRenderPagination(globalTotalPages, globalTotalPages);
        break;

      default:
        return;
    }
  };
}

function onRenderMarkupByPagination(page) {

  refs.spinner.classList.remove('is-hidden'); // активируем спинер

  if (apiSearchData.query === "") {
    
    if (yearValue || genreValue || sortValue) {    
      movieFilter.page = page;
      createCard(genreValue, yearValue, sortValue);
    }

    popularMovie.page = page;
    popularMovie.fetchPopular()
      .then(film => {
        filmsStorage.addToCurrent(film.results);

        const markup = filmCard(handleMovieCard(film.results)); 
        refs.galleryEl.innerHTML = markup;

        onRenderPagination(film.total_pages, film.page);
      })
      .catch(error => {
        filmsStorage.addToCurrent(film.results);

        const markup = filmCard(handleMovieCard(film.results)); 
        refs.galleryEl.innerHTML = markup;

        onRenderPagination(film.total_pages, film.page);
        //console.log('onRenderMarkupByPagination - catch(error): ', error);
      })
      .finally(() => {
        refs.spinner.classList.add('is-hidden'); // деактивируем спинер
      });
  }

  else {
    apiSearchData.page = page;    
    apiSearchData.fetchMovies()
      .then(film => {          
        filmsStorage.addToCurrent(film.results);

        const markup = filmCard(handleMovieCard(film.results)); 
        refs.galleryEl.innerHTML = markup;

        onRenderPagination(film.total_pages, film.page); 
      })
      .catch(error => console.log(console.error(error)))
      .finally(() => {
        refs.spinner.classList.add('is-hidden'); // деактивируем спинер
      });
  }
}

export { onRenderPagination };