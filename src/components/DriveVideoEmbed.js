import React from 'react';

const DriveVideoEmbed = ({ videoId }) => {
  const src = `https://drive.google.com/file/d/${videoId}/preview`;
  return (
    <div className="video-embed-container" style={{ overflow: 'hidden', paddingBottom: '56.25%', position: 'relative', height: 0 }}>
      <iframe
        src={src}
        style={{ left: 0, top: 0, height: '100%', width: '100%', position: 'absolute' }}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Embedded Video"
      ></iframe>
    </div>
  );
};

export default DriveVideoEmbed;
