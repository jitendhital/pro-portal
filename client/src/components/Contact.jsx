import { useEffect, useState } from 'react';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/${listing.userRef}`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch landlord information');
        }
        
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (listing.userRef) {
      fetchLandlord();
    }
  }, [listing.userRef]);

  if (loading) {
    return <p className='text-slate-600'>Loading landlord information...</p>;
  }

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-2'>
          <p>
            Contact {landlord.username} for {listing.name.toLowerCase()}
          </p>
          <textarea
            name='message'
            id='message'
            rows='2'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-lg'
          ></textarea>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(landlord.email)}&su=${encodeURIComponent(`Regarding ${listing.name}`)}&body=${encodeURIComponent(message)}`}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95 w-full block no-underline'
            style={{ textDecoration: 'none' }}
          >
            Send Message
          </a>
        </div>
      )}
    </>
  );
}

