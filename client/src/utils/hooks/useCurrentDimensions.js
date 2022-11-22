import { useState, useEffect } from 'react';

const getWidth = (id) => id ? document.getElementById(id).innerWidth || document.getElementById(id).clientWidth : window.innerWidth 
  || document.documentElement.clientWidth 
  || document.body.clientWidth;

const getHeight = (id) => id ? document.getElementById(id).innerHeight|| document.getElementById(id).clientHeight : window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;

const useCurrentDimensions = (id) => {
  let [width, setWidth] = useState(getWidth(id));
  let [height, setHeight] = useState(getHeight(id));

  useEffect(() => {
    let timeout = null;
    const resizeListener = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWidth(getWidth(id));
        setHeight(getHeight(id));
      }, 150);
    };
    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    }
  }, [id])

  return { width, height };
}

export default useCurrentDimensions;