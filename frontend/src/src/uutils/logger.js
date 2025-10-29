function logger(data){
    if (import.meta.env.VITE_NODE_ENV === 'development') {
        return console.log(data);
    } else {
        return () => {};
    }
}
export default logger;