
  class Response {
    
    constructor(res) {
      this.response = res;
    }
  
    setStatusCode(code) {
      this.code = code;
      return this;
    }
  
    setCustomCode(code) {
      this.customCode = code;
      return this;
    }
  
    setMessage(msg) {
      this.message = msg;
      return this;
    }
    setID(id){
      this.ID = id;
      return this; 
    }
  
    setResponse(data) {
      this.data = data;
      return this;
    }
  
    send() {
      this.response.status(this.code || 200).send({
        id:this.ID,
        code: this.customCode,
        message: this.message,
        data: this.data,
      });
    }
  }
  
  module.exports = Response;