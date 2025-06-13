export default function Footer() {
return (
    <footer style={footerStyle}>

    <div >
        <ul>
        <li><a href="#">Info about Dalhousie SE Lab</a></li>
        <li><a href="#">Contact Info</a></li>
        </ul>
    </div>
    <div>
        <img src="../../Lumora.jpeg" alt="LUMORA Logo" style={{ height: '100px' }} />
    </div>
    <div >
        <ul>
        <li><a href="#">Copyrights</a></li>
        <li><a href="#">References</a></li>
        <li><a href="#">FAQs</a></li>
        </ul>
    </div>
    </footer>
);
}

const footerStyle = {
display: 'flex',
justifyContent: 'space-evenly',
paddingTop: '20px',
alignItems: 'center',

ahover: {
    textDecoration: 'underline',
    color: 'black',
    fontSize: '14px',
},


};
