import { useState, useEffect } from 'react';

const getDimension = (dimension) => window.inner[dimension]
  || document.documentElement.client[dimension]
  || document.body.client[dimension];

const useWindowSize = () => {
  let [width, setWidth] = useState(getDimension('Width'));
  let [height, setHeight] = useState(getDimension('Height'));

  useEffect(() => {
    let timeout = null;
    const resizeListener = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWidth(getDimension('Width'));
        setHeight(getDimension('Height'));
      }, 150);
    };
    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('resize', resizeListener);
    }
  }, [])

  return { width, height };
}

export default useWindowSize;