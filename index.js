let socket ;
 let roomId = undefined;
const user = {};

const getElementById = (id) => document.getElementById(id) || null;

//* get DOM element
const helloStrangerElement = getElementById('hello_stranger');
const chattingBoxElement = getElementById('chatting_box');
const formElement = getElementById('chat_form');
const createRoomFrom = getElementById('create_room_form');
const roomIdInput = getElementById('roomid_input');
const roomIdSetBtn = getElementById('roomid_set');
//* global socket handler


//* event callback handler
const handleSubmit = (event) => {
  event.preventDefault();
  if(!roomId)return;
  const inputValue = event.target.elements[0].value;
  if (!inputValue) return;
  socket.emit('sendMessage', {
    roomId,
    message: inputValue,
});
  drawNewChat(`me : ${inputValue}`);
  event.target.elements[0].value = '';
  // 화면에다 그리기
};

//* draw functions
const drawHelloStranger = (username) => {
  helloStrangerElement.innerHTML = `Hello, ${username} Stranger!`;
};
const drawNewChat = (message) => {
  const wrapperChatBox = document.createElement('div');
  const chatBox = `
        <div>
            ${message}
        </div>`;
  wrapperChatBox.innerHTML = chatBox;
  chattingBoxElement.appendChild(wrapperChatBox);
};

const createRoom = (event) => {
    event.preventDefault();
    console.log('createRoom');
    const inputValue = event.target.elements[0].value;
    const participants = document.getElementById('participants').value; 
    if (!inputValue) return;
    socket.emit('createRoom', inputValue,[participants]);
    console.log(inputValue+'방 생성');
    event.target.elements[0].value = '';
    
    document.getElementById('participants').value = '';
}

// 방을 만든 경우 방id를 받아서 roomId에 저장해야함
const setRoomId = (event) => {
    event.preventDefault();
    const _roomId = roomIdInput.value;
    if(!_roomId) return;
    roomId = _roomId;
    roomIdInput.value = '';
}


async function helloUser() {
    const email = prompt('email');
    const password = prompt('password');
    const result = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
    }).catch((err) => {
        console.log(err);
    });
    const { token,userId } = result.data;
    user.id = userId;
    console.log(token);
    console.log(userId);
    socket = await io('http://localhost:3001/chat',{
    query: {
        token,
    }
    });
    socket.on('user_connected', (data) => {
        drawNewChat(`user_connected: ${data}`);
      });
      socket.on('chattingMessage', (data) => {
        console.log(data);
        const { userId,name,message } = data;
        if(userId !== user.id){ 
        drawNewChat(`${name}: ${message}`);
        }
      });
      socket.on('invitedRoom',(data)=>{
        socket.emit('joinRoom',data.roomId);
        roomId = data.roomId;
        console.log(data.roomId+'방 입장');
      })
  }

function init() {
    helloUser();
    formElement.addEventListener('submit', handleSubmit);
    createRoomFrom.addEventListener('submit', createRoom);
    roomIdSetBtn.addEventListener('click', setRoomId);
}

init();
