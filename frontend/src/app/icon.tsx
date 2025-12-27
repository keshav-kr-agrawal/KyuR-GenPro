import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px solid #22c55e', // Green Border
          borderRadius: '0px',
        }}
      >
        {/* The Center Square */}
        <div
          style={{
            width: '12px',
            height: '12px',
            background: '#22c55e', // Green Fill
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}