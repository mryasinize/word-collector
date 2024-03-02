import { useEffect, useState } from "react";

export default function App() {
  const [shouldDisplayAnswer, setShouldDisplayAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCount, setCurrentCount] = useState(1);
  const [wordsInfo, setWordsInfo] = useState();
  const wordCount = 10;

  const fetchWords = () => {
    setIsLoading(true);
    setShouldDisplayAnswer(false);
    fetch("http://localhost:4137/getRandomWords?count=" + wordCount)
      .then((res) => res.json())
      .then((res) => {
        setWordsInfo(res.randomWordsInfo);
        setError(null);
        setIsLoading(false);
        console.log(res);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err);
        console.log(err);
      });
  };

  const capitalizeFirstLetter = (string) => {
    if (string.length === 0) return string;

    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const closeApp = () => {
    const { ipcRenderer } = window.require("electron");
    ipcRenderer.send("close-app");
  };

  const navigateTo = (direction) => {
    setShouldDisplayAnswer(false);
    setCurrentCount((prevCount) => {
      if (direction === "prev" && prevCount !== 1) {
        return prevCount - 1;
      } else if (direction === "next" && prevCount !== wordCount) {
        return prevCount + 1;
      }
      return prevCount;
    });
  };

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(
      wordsInfo[currentCount - 1][0]
    );
    utterance.voice = window.speechSynthesis.getVoices()[6];
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    fetchWords();
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        navigateTo("next");
      } else if (event.key === "ArrowLeft") {
        navigateTo("prev");
      } else if (event.key === "Enter") {
        setShouldDisplayAnswer(true);
      }
    });
  }, []);
  return (
    <div className="flex relative items-center justify-center flex-col bg-white border max-w-[630px] min-h-[360px] rounded-[15px]">
      <button onClick={closeApp} className="absolute right-5 top-5">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L17 17M17 1L1 17"
            stroke="#6A6A6A"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      {!isLoading && error && (
        <>
          <div className="text-clr text-[20px] select-none text-red-500 mb-2">
            {error.message}
          </div>
          <button
            onClick={fetchWords}
            className="bg-[#0175ce] px-2 py-1 text-white rounded-md"
          >
            Try again
          </button>
        </>
      )}
      {isLoading ? (
        <div className="text-clr text-[20px] select-none">Loading...</div>
      ) : (
        !error && (
          <>
            <div className="text-clr text-[19px] absolute top-5 select-none">
              What is the meaning of this word? 🤔
            </div>
            <div className="text-clr center">
              <div className="flex items-center justify-center gap-[10px] overflow-y-auto max-h-44">
                {(currentCount - 1) % 2 === 0 && (
                  <button onClick={speak}>
                    <svg
                      width="22"
                      height="20"
                      viewBox="0 0 22 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.114 3.636C18.9497 4.47173 19.6127 5.46389 20.065 6.55582C20.5173 7.64776 20.7501 8.81809 20.7501 10C20.7501 11.1819 20.5173 12.3522 20.065 13.4442C19.6127 14.5361 18.9497 15.5283 18.114 16.364M15.463 6.288C16.4474 7.27254 17.0004 8.60777 17.0004 10C17.0004 11.3922 16.4474 12.7275 15.463 13.712M5.75 6.25L10.47 1.53C10.5749 1.42524 10.7085 1.35392 10.8539 1.32503C10.9993 1.29615 11.15 1.311 11.2869 1.36771C11.4239 1.42442 11.541 1.52045 11.6234 1.64367C11.7058 1.76688 11.7499 1.91176 11.75 2.06V17.94C11.7499 18.0882 11.7058 18.2331 11.6234 18.3563C11.541 18.4795 11.4239 18.5756 11.2869 18.6323C11.15 18.689 10.9993 18.7038 10.8539 18.675C10.7085 18.6461 10.5749 18.5748 10.47 18.47L5.75 13.75H3.51C2.63 13.75 1.806 13.243 1.572 12.396C1.35751 11.6154 1.2492 10.8095 1.25 10C1.25 9.17 1.362 8.367 1.572 7.604C1.806 6.756 2.63 6.25 3.51 6.25H5.75Z"
                        stroke="#777777"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                )}
                <h1 className="text-[25px] font-medium max-w-[400px] text-center">
                  {capitalizeFirstLetter(
                    wordsInfo[currentCount - 1][(currentCount - 1) % 2]
                  )}
                </h1>
              </div>
              <div className="center flex-row gap-[10px]">
                {shouldDisplayAnswer ? (
                  <>
                    {(currentCount - 1) % 2 === 1 && (
                      <button onClick={speak}>
                        <svg
                          width="22"
                          height="20"
                          viewBox="0 0 22 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18.114 3.636C18.9497 4.47173 19.6127 5.46389 20.065 6.55582C20.5173 7.64776 20.7501 8.81809 20.7501 10C20.7501 11.1819 20.5173 12.3522 20.065 13.4442C19.6127 14.5361 18.9497 15.5283 18.114 16.364M15.463 6.288C16.4474 7.27254 17.0004 8.60777 17.0004 10C17.0004 11.3922 16.4474 12.7275 15.463 13.712M5.75 6.25L10.47 1.53C10.5749 1.42524 10.7085 1.35392 10.8539 1.32503C10.9993 1.29615 11.15 1.311 11.2869 1.36771C11.4239 1.42442 11.541 1.52045 11.6234 1.64367C11.7058 1.76688 11.7499 1.91176 11.75 2.06V17.94C11.7499 18.0882 11.7058 18.2331 11.6234 18.3563C11.541 18.4795 11.4239 18.5756 11.2869 18.6323C11.15 18.689 10.9993 18.7038 10.8539 18.675C10.7085 18.6461 10.5749 18.5748 10.47 18.47L5.75 13.75H3.51C2.63 13.75 1.806 13.243 1.572 12.396C1.35751 11.6154 1.2492 10.8095 1.25 10C1.25 9.17 1.362 8.367 1.572 7.604C1.806 6.756 2.63 6.25 3.51 6.25H5.75Z"
                            stroke="#777777"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <p className="max-w-[400px] text-center">
                      {wordsInfo[currentCount - 1][currentCount % 2]}
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => setShouldDisplayAnswer(true)}
                    className="text-[#0175ce] font-medium select-none"
                  >
                    See answer 👀
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center px-5 absolute inset-0 pointer-events-none">
              <button
                disabled={currentCount === 1}
                onClick={() => {
                  navigateTo("prev");
                }}
                className="btn disabled:bg-[#bdbdbd8a]"
              >
                <svg
                  width="8"
                  height="17"
                  viewBox="0 0 8 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.26317 0.684263C7.35635 0.683015 7.44875 0.70321 7.53441 0.743551C7.62006 0.783893 7.69709 0.843486 7.76054 0.918501C8.04475 1.23082 8.04475 1.71491 7.76054 2.02723L1.86317 8.50783L7.76054 14.9728C8.04475 15.2851 8.04475 15.7692 7.76054 16.0815C7.47633 16.3939 7.0358 16.3939 6.75159 16.0815L0.371062 9.03877C0.0868515 8.72646 0.0868515 8.24236 0.371062 7.93005L6.7658 0.918501C6.9079 0.762342 7.09264 0.684263 7.26317 0.684263Z"
                    fill="white"
                  />
                </svg>
              </button>
              <button
                disabled={currentCount === wordCount}
                onClick={() => {
                  navigateTo("next");
                }}
                className="btn disabled:bg-[#bdbdbd8a]"
              >
                <svg
                  width="8"
                  height="17"
                  viewBox="0 0 8 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.737138 16.3157C0.643951 16.317 0.551558 16.2968 0.465899 16.2564C0.380241 16.2161 0.303213 16.1565 0.239769 16.0815C-0.0444413 15.7692 -0.0444413 15.2851 0.239769 14.9728L6.13714 8.49216L0.239769 2.02717C-0.0444413 1.71485 -0.0444413 1.23076 0.239769 0.918443C0.52398 0.606125 0.964506 0.606125 1.24872 0.918443L7.62924 7.96122C7.91345 8.27354 7.91345 8.75763 7.62924 9.06995L1.23451 16.0815C1.0924 16.2377 0.907664 16.3157 0.737138 16.3157Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-5 select-none">
              <span className="text-[#838383]">
                {currentCount}/{wordCount}
              </span>
            </div>
          </>
        )
      )}
    </div>
  );
}
