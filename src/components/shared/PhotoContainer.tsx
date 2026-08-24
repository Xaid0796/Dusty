import React from 'react';
import { Camera } from 'lucide-react';

interface PhotoContainerProps {
  photoUrl?: string;
  fullName: string;
  shape?: 'square' | 'rounded' | 'circle';
  width: string | number;
  height: string | number;
  borderWidth?: string;
  borderColor?: string;
  style?: React.CSSProperties;
}

export const PhotoContainer: React.FC<PhotoContainerProps> = ({
  photoUrl,
  fullName,
  shape = 'square',
  width,
  height,
  borderWidth = '1px',
  borderColor = '#cbd5e1',
  style,
}) => {
  const getBorderRadius = () => {
    switch (shape) {
      case 'circle':
        return '50%';
      case 'rounded':
        return '12px';
      case 'square':
      default:
        return '0px';
    }
  };

  const containerStyle: React.CSSProperties = {
    width,
    height,
    overflow: 'hidden',
    flexShrink: 0,
    borderRadius: getBorderRadius(),
    border: `${borderWidth} solid ${borderColor}`,
    backgroundColor: '#f8fafc',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    ...style,
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  const placeholderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#94a3b8',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    padding: '8px',
    width: '100%',
    height: '100%',
    userSelect: 'none',
  };

  return (
    <div style={containerStyle}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={fullName} style={imgStyle} />
      ) : (
        <div style={placeholderStyle}>
          <Camera size={18} color="#cbd5e1" />
          <span>Your Photo</span>
        </div>
      )}
    </div>
  );
};

export default PhotoContainer;
