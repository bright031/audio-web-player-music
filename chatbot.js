document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    const closeBtn = document.querySelector('.chatbot header span');
    const chatbox = document.querySelector('.chatbox');
    const chatInput = document.querySelector('.chat-input textarea');
    const sendChatBtn = document.querySelector('.chat-input span');

    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;

 
    const API_KEY = "AIzaSyBr6wy6P-eu5YMwYp6X_U8yzxw-ioUDssU";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

   
    const websiteInfo = `
        Tớ là chatbot của Audiora - một website nghe nhạc siêu đỉnh! Audiora có các playlist như "WeChoice 2024 & 2023" với những bài hit cực chất, "Dương Domic Radio" chill chill, "Dòng chảy rap Việt" cho fan rap, và còn nhiều playlist khác nữa. Ngoài ra, có các album như "ACPBĐTĐĐ" của HIEUTHUHAI, "ái" của tlinh, "Bật nó lên" của SOOBIN Hoàng Sơn, "LINK" của Hoàng Thùy Linh, "THE WXRDIES" của Wxrdie, "Dữ Liệu Quý" của Dương Domic. Danh sách nghệ sĩ thì đỉnh của chóp: Sơn Tùng M-TP, Hoàng Thùy Linh, tlinh, HIEUTHUHAI, Đen Vâu, NEGAV, Dương Domic, Wxrdie, SOOBIN Hoàng Sơn – toàn sao lớn! Tớ có thể bật nhạc, dừng nhạc, phát ngẫu nhiên, chuyển bài, hoặc kể bạn nghe về nghệ sĩ. Hỏi gì cũng được, tớ xử lý hết nha!
    `;


    const allSongs = [
        ...songs,
        ...Object.values(albums).flat(),
        ...Object.values(playlists).flat()
    ];


    const songCount = allSongs.length;
    const playlistCount = Object.keys(playlists).length;
    const albumCount = Object.keys(albums).length;

    const artists = [...new Set(allSongs.map(item => item.artist))];
    const songsByArtist = artists.reduce((acc, artist) => {
        acc[artist] = allSongs.filter(item => item.artist === artist).map(item => item.name);
        return acc;
    }, {});

    const createChatLi = (message, className) => {
        const chatLi = document.createElement('li');
        chatLi.classList.add('chat', className);
        let chatContent = className === 'outgoing' 
            ? `<p></p>` 
            : `<span class="fa fa-robot"></span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector('p').textContent = message;
        return chatLi;
    };

    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector('p');
        const songContext = allSongs.map(song => `Bài hát: "${song.name}" - ${song.artist} (src: ${song.src})`).join('\n');
        const countsInfo = `
            Số lượng bài hát: ${songCount}
            Số lượng playlist: ${playlistCount}
            Số lượng album: ${albumCount}
            Số lượng nghệ sĩ: ${artists.length}
        `;
        const artistSongInfo = artists.map(artist => `${artist}: ${songsByArtist[artist].join(', ')}`).join('\n');
        const playlistInfo = Object.keys(playlists).map(playlist => `${playlist}: ${playlists[playlist].map(song => `"${song.name}" - ${song.artist}`).join(', ')}`).join('\n');
        const albumInfo = Object.keys(albums).map(album => `${album}: ${albums[album].map(song => `"${song.name}" - ${song.artist}`).join(', ')}`).join('\n');
        const prompt = `
            Bạn là một chatbot siêu thân thiện của Audiora, hãy trả lời bằng ngôn ngữ tự nhiên, gần gũi như một người bạn thân, hiểu rõ về website và âm nhạc trên đó. Dựa vào thông tin sau:
            - Thông tin website: ${websiteInfo}
            - Danh sách bài hát: ${songContext}
            - ${countsInfo}
            - Nghệ sĩ và bài hát: ${artistSongInfo}
            - Playlist: ${playlistInfo}
            - Album: ${albumInfo}
            Hãy đối đáp thoải mái, tự nhiên, tập trung vào tên bài hát, nghệ sĩ, playlist, hoặc album nếu được hỏi. 
            - Nếu câu hỏi là "ai hát bài X", trả lời chính xác nghệ sĩ của bài đó.
            - Nếu yêu cầu "bật" hoặc "phát" bài hát, trả lời "Đang bật bài [tên bài] của [nghệ sĩ] đây!" và bật bài đó nếu có src.
            - Nếu yêu cầu "dừng", trả lời "OK, tớ dừng nhạc đây!" và dừng nhạc.
            - Nếu yêu cầu "phát ngẫu nhiên" hoặc "bật ngẫu nhiên", trả lời "Phát ngẫu nhiên một bài cho bạn đây!" và bật bài ngẫu nhiên.
            - Nếu yêu cầu "chuyển bài" hoặc "bài tiếp theo", trả lời "Chuyển bài tiếp theo đây!" và chuyển sang bài tiếp.
            - Nếu hỏi "thông tin nghệ sĩ X" hoặc "kể về X", trả lời thông tin về nghệ sĩ đó dựa trên bài hát họ có.
            - Nếu không biết hoặc không làm được, nói "Tớ chịu, không làm được cái này!" một cách vui vẻ. Đừng nghiêm túc quá, cứ chill như trò chuyện với bạn thân nhé!
            Câu hỏi: ${userMessage}
        `;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: prompt }]
                }]
            }),
        };

        try {
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API request failed');
            if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
                throw new Error('Invalid response from API');
            }
            const reply = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
            messageElement.textContent = reply;


            const lowerMessage = userMessage.toLowerCase();

            if (lowerMessage.includes('bật') || lowerMessage.includes('phát') || lowerMessage.includes('bật bài')) {
                if (lowerMessage.includes('ngẫu nhiên')) {
                    if (typeof window.shuffleSong === 'function') {
                        window.shuffleSong(); // Gọi hàm phát ngẫu nhiên từ music-player.js
                        messageElement.textContent = "Phát ngẫu nhiên một bài cho bạn đây!";
                    } else {
                        messageElement.textContent = "Tớ không phát ngẫu nhiên được, sorry nha!";
                    }
                } else {
                    const songMatch = allSongs.find(song => 
                        lowerMessage.includes(song.name.toLowerCase()) || 
                        lowerMessage.includes(song.artist.toLowerCase())
                    );
                    if (songMatch && songMatch.src) {
                        if (typeof window.playAudio === 'function') {
                            window.playAudio(songMatch); 
                            messageElement.textContent = `Đang bật bài "${songMatch.name}" của ${songMatch.artist} đây!`;
                        } else {
                            messageElement.textContent = "Tớ không bật được bài này vì music player chưa sẵn sàng, sorry nha!";
                        }
                    } else {
                        messageElement.textContent = "Tớ không bật được bài này, sorry nha! Chắc chưa có trong danh sách.";
                    }
                }
            }

            if (lowerMessage.includes('dừng') || lowerMessage.includes('tắt')) {
                if (typeof window.playPause === 'function') {
                    const audioPlayer = document.getElementById('audio-player');
                    if (!audioPlayer.paused) {
                        window.playPause(); 
                        messageElement.textContent = "OK, tớ dừng nhạc đây!";
                    } else {
                        messageElement.textContent = "Nhạc đang dừng sẵn rồi mà!";
                    }
                } else {
                    messageElement.textContent = "Tớ không dừng được nhạc, sorry nha!";
                }
            }


            if (lowerMessage.includes('chuyển bài') || lowerMessage.includes('bài tiếp') || lowerMessage.includes('tiếp theo')) {
                if (typeof window.nextSong === 'function') {
                    window.nextSong(); 
                    messageElement.textContent = "Chuyển bài tiếp theo đây!";
                } else {
                    messageElement.textContent = "Tớ không chuyển bài được, sorry nha!";
                }
            }


            if (lowerMessage.includes('thông tin') || lowerMessage.includes('kể về') || lowerMessage.includes('nghệ sĩ')) {
                const artistMatch = artists.find(artist => lowerMessage.includes(artist.toLowerCase()));
                if (artistMatch) {
                    const artistSongs = songsByArtist[artistMatch];
                    messageElement.textContent = `Nghệ sĩ ${artistMatch} có mấy bài hay nha: ${artistSongs.join(', ')}. Bạn muốn nghe bài nào của ${artistMatch} không?`;
                } else {
                    messageElement.textContent = "Tớ chịu, không tìm thấy thông tin về nghệ sĩ này! Bạn thử hỏi nghệ sĩ khác xem!";
                }
            }
        } catch (error) {
            messageElement.classList.add('error');
            messageElement.textContent = `Tớ gặp lỗi rồi: ${error.message}. Thử lại nha!`;
        } finally {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    };

    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = '';
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            const incomingChatLi = createChatLi('Đợi xíu nhen.....', 'incoming');
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    };

    chatbotToggler.addEventListener('click', () => {
        document.body.classList.toggle('show-chatbot');
        if (document.body.classList.contains('show-chatbot') && chatbox.children.length === 0) {
            chatbox.appendChild(createChatLi('Chào bạn! Tớ là bạn thân của Audiora đây. Hỏi gì về nhạc, nghệ sĩ, playlist, album hay yêu cầu bật, dừng, chuyển bài, tớ xử hết nha, chill thôi!', 'incoming'));
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => document.body.classList.remove('show-chatbot'));
    } else {
        console.warn('Close button not found in chatbot header');
    }

    chatInput.addEventListener('input', () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener('click', handleChat);
});