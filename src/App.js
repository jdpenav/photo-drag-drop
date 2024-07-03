// App.js
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toPng } from 'html-to-image';

const ItemType = 'IMAGE';

const Image = ({ src }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { src },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    width: '100px',
  };

  return <img ref={ref} src={src} alt="Draggable" style={style} />;
};

const Frame = ({ acceptImage, frameSrc }) => {
  const [{ isOver, canDrop }, ref] = useDrop({
    accept: ItemType,
    drop: (item) => acceptImage(item.src),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = '#fff';
  if (isActive) {
    backgroundColor = '#f0f0f0';
  } else if (canDrop) {
    backgroundColor = '#f9f9f9';
  }

  return (
    <div
      ref={ref}
      style={{
        width: '33.33%',
        height: '50%',
        border: '1px solid black',
        position: 'relative',
        backgroundColor,
        overflow: 'hidden',
      }}
    >
      {frameSrc && (
        <img
          src={frameSrc}
          alt="Frame"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
    </div>
  );
};

const PhotoGrid = ({ frames, handleDrop }) => {
  return (
    <div
      id="photo-grid"
      style={{
        width: '360px', // scaled down from 1080px
        height: '640px', // scaled down from 1920px
        display: 'flex',
        flexWrap: 'wrap',
        border: '2px solid #ccc',
        margin: 'auto',
      }}
    >
      {frames.map((src, index) => (
        <Frame key={index} acceptImage={(src) => handleDrop(index, src)} frameSrc={src} />
      ))}
    </div>
  );
};

const App = () => {
  const [frames, setFrames] = useState(Array(6).fill(null));

  const handleDrop = (index, src) => {
    const newFrames = [...frames];
    newFrames[index] = src;
    setFrames(newFrames);
  };

  const handleDownload = () => {
    const node = document.getElementById('photo-grid');
    const images = node.getElementsByTagName('img');

    let imagesLoadedCount = 0;

    for (let img of images) {
      if (img.complete) {
        imagesLoadedCount++;
      } else {
        img.onload = () => {
          imagesLoadedCount++;
          if (imagesLoadedCount === images.length) {
            generateImage(node);
          }
        };
      }
    }

    if (imagesLoadedCount === images.length) {
      generateImage(node);
    }
  };

  const generateImage = (node) => {
    toPng(node)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'story.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error generating image:', err);
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ marginRight: '20px' }}>Drag and Drop Photo Grid</h1>
          <button
            onClick={handleDownload}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Download as Image
          </button>
        </div>
        <div>
          <Image src="https://via.placeholder.com/150" />
          <Image src="https://via.placeholder.com/150" />
        </div>
        <PhotoGrid frames={frames} handleDrop={handleDrop} />
      </div>
    </DndProvider>
  );
};

export default App;
