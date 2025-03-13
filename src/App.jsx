import { useState, useEffect, use } from 'react'
import './App.css'
import React from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/movieCard'
import {useDebounce} from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const API_BASE_URL='https://api.themoviedb.org/3'
const API_KEY= import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [moviesList, setMoviesList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }
  , 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Error fetching movies');
      }
      const data = await response.json();
      if(data.response === 'False') {
        setErrorMessage(data.Error || 'Error fetching movies');
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);
      
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error searching for movies: ${error}`)
      setErrorMessage('Error searching movies. Please try again later');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }
    catch (error) {
      console.error(`Error loading trending movies: ${error}`)
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }
  ,[debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }
  ,[]);

  return (
    <main>
      <div className='pattern'/>
        <div className='wrapper'>
          <header>
            <img src="/hero.png" alt="" />
            <h1> Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          {trendingMovies.length > 0 && (
            <section className='trending'>
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index+1}</p>
                    <img src={movie.poster_url} alt="" />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className='all-movies'>
            <h2 className=''>All Movies</h2>
            {isLoading ? (
              <Spinner/>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                  // <li key={movie.id}>
                  //   <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
                  //   <h3>{movie.title}</h3>
                  //   <p>{movie.overview}</p>
                  // </li>
                ))}
              </ul>
            )}
          </section>
        </div>
    </main>
  )
}
export default App












// const Card = ({title}) => {
//   const [count, setCount] = useState(0);
//   const [hasLiked, setHasLiked] = useState(false);

//   useEffect(() => {
//     console.log(`${title} has been liked: ${hasLiked}. It has been liked ${count} times`)
//   }
//   ,[hasLiked])
//   // useEffect(() => {
//   //   console.log(`${title} has been clicked ${count} times`)
//   // }
//   // ,[count])


//   return (
//     <div className='card' onClick={() => setCount((prevState) => (prevState + 1))}>
//       <h2>{title} <br /> {count || null}</h2> 
//       <button onClick={()=> setHasLiked(!hasLiked)}>
//       {hasLiked ? '❤️' : '🤍'}
//       </button>
//     </div>
//   )
// }

// const App = () => {

//   return (
//     <div className='card-container'>
//       {/* <h2>Movie List</h2> */}
//       <Card title='Star Wars' rating={5} isCool={true} actors = {[{name: 'Jessica Alba'}]} />
//       <Card title='Avatar'/>
//       <Card title='Lion King'/>
//     </div>
//   )
// }
// export default App



