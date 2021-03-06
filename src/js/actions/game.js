const prefix = "game";

export const STARTED_GAME = `${prefix}_started_game`;
export const SET_QUESTIONS = `${prefix}_set_questions`;
export const SEND_ANSWER = `${prefix}_send_answer`;

export const sendAnswer = (questionId, answerId, time) => {
  return dispatch => {
    dispatch({
      type: SEND_ANSWER,
      payload: {
        questionId,
        answerId,
        time
      }
    });
  };
};
