import axios from 'axios';


const API_V1 = 'https://6666c7aea2f8516ff7a4e261.mockapi.io/api/dummy-data';
const API_V2 = 'https://6686cb5583c983911b03a7f3.mockapi.io/api/dummy-data';
const BOOK = 'https://6686cb5583c983911b03a7f3.mockapi.io/api/dummy-data/summaryBookings';
export const getMasterUnit = () => {
  return axios.get(`${API_V1}/masterOffice`);
};

export const getMasterMeetingRooms = () => {
  return axios.get(`${API_V1}/masterMeetingRooms`);
};

export const getMasterJenisKonsumsi = () => {
  return axios.get(`${API_V2}/masterJenisKonsumsi`);
};


export const getSummaryBookings = () => {
  return axios.get(BOOK);
};