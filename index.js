
//Implementation of a min-heap
class MinHeap {

    constructor() 
    {
        //Initialises an empty array for the heap
        this.heap = [];
    }


    //Inserts a new value in the heap
    push(value) 
    {
        //Inserts a new value in the heap
        this.heap.push(value);

        //Moves the element up to it's correct place in the heap array
        this.up_heapify();
    }



    get_min() {
        //stores the minimum element of the heap
        const max = this.heap[0];

        //pops the last element from the heap
        const tmp = this.heap.pop();


        if(!this.empty()) 
        {
            //moves the last element of the heap to first
            this.heap[0] = tmp;
            //down heapifies the last element to it's appropriate position
            this.down_heapify(0);
        }

        //Returns the minimum element of the heap array 
        return max;
    }


    size() 
    {
        //Returns the size of the heap array
        return this.heap.length;
    }

    empty()
    {
        //Returns if the heap is empty
        return ( this.size()===0 );
    }


    //Up heapifies the heap array iteratively
    // (i.e Moves the element up to it's correct place in the heap array)
    up_heapify() 
    {
        let idx = this.size() - 1;


        //Loop continues till the element reaches it's appropriate place up the heap array
        while (idx > 0) 
        {
            let element = this.heap[idx],
                parentIdx = Math.floor((idx - 1) / 2),
                parent = this.heap[parentIdx];

            if (parent[0] <= element[0]) 
            {
                break;
            }
            this.heap[idx] = parent;
            this.heap[parentIdx] = element;
            idx = parentIdx
        }
    }

    //Down heapifies the heap array recursively
    // (i.e Moves the element up to it's correct place in the heap array)
    down_heapify(index) {

        let left = 2 * index + 1,
            right = 2 * index + 2,
            smallest = index;
        const length = this.size();
        if (left < length && this.heap[left][0] < this.heap[smallest][0]) 
        {
            smallest = left
        }
        if (right < length && this.heap[right][0] < this.heap[smallest][0]) 
        {
            smallest = right
        }
        if (smallest !== index) 
        {
            let tmp = this.heap[smallest];
            this.heap[smallest] = this.heap[index];
            this.heap[index] = tmp;
            this.down_heapify(smallest)
        }
    }

}



class Huffman_Encoder_Decoder{

    //runs a dfs to assign a binary code to each character
    getCodes(node, path)
    {
        if(typeof(node[1])==="string")
        {
            this.mappings[node[1]] = path;
            return;
        }
        this.getCodes(node[1][0], path+"0");
        this.getCodes(node[1][1], path+"1");
    }

   //encoder function
   encode(data)
   {
        this.heap = new MinHeap();
        const mp = new Map();

        //Maps each of the character to it's frequency in the text file
        for(let i=0;i<data.length;i++)
        {
            if(data[i] in mp)
            {
                mp[data[i]] = mp[data[i]] + 1;
            } else{
                mp[data[i]] = 1;
            }
        }


        //Pushes the element and it's frequencies to the heap
        for(const key in mp)
        {
            this.heap.push([mp[key], key]);
        }

        //Constructs the huffman tree
        while(this.heap.size() > 1)
        {
            const node1 = this.heap.get_min();
            const node2 = this.heap.get_min();

            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.push(node);
        }
        const huffman_encoder = this.heap.get_min();

        this.mappings = {};
        this.getCodes(huffman_encoder, "");

        let binary_string = "";
        for(let i=0;i<data.length;i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }

        let rem = (8 - binary_string.length%8)%8;

        //Adds padding to the text to make the length divisible by 8
        let padding = "";
        for(let i=0;i<rem;i++)
            padding = padding + "0";
        binary_string = binary_string + padding;

        let result = "";
        for(let i=0;i<binary_string.length;i+=8){
            let num = 0;
            for(let j=0;j<8;j++){
                num = num*2 + (binary_string[i+j]-"0");
            }
            result = result + String.fromCharCode(num);
        }

        let final_res = this.make_string(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + data.length/final_res.length;
        info = "Compression complete and file sent for download" + '\n' + info;
        return [final_res,binary_string];
    }


    //decoder
    decode(data)
    {
        data = data.split('\n');
        if(data.length===4){
            // Handling the presence of new line in file
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }
 
        this.ind = 0;
        const huffman_decoder = this.make_tree(data[0]);
        const text = data[2];
 
        let binary_string = "";

		/// retrieve binary string from encoded data
        for(let i=0;i<text.length;i++)
        {
            let num = text[i].charCodeAt(0);
            let bin = "";
            for(let j=0;j<8;j++){
                bin = num%2 + bin;
                num = Math.floor(num/2);
            }
            binary_string = binary_string + bin;
        }

		/// remove padding
        binary_string = binary_string.substring(0,binary_string.length-data[1]);
 
        console.log(binary_string.length);


        /// decode the data using binary string and huffman tree
        let res = "";
        let node = huffman_decoder;
        for(let i=0;i<binary_string.length;i++){
            if(binary_string[i]==='0'){
                node = node[0];
            } else{
                node = node[1];
            }
 
            if(typeof(node[0])==="string"){
                res += node[0];
                node = huffman_decoder;
            }
        }
        return [res,binary_string];
    }


    //Displays the tree by printing the left and right child of eveery node
    display(node, modify, index=1){
       if(modify){
           node = ['',node];
           if(node[1].length===1)
               node[1] = node[1][0];
       }

       if(typeof(node[1])==="string"){
           return String(index) + " = " + node[1];
       }

       let left = this.display(node[1][0], modify, index*2);
       let right = this.display(node[1][1], modify, index*2+1);
       let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
       return res + '\n' + left + '\n' + right;
   }


    // Converts the huffman tree into a string for storing purpose
    make_string(node){

        if(typeof(node[1])==="string"){
            return '\''+node[1];
        }
 
        return '0' + this.make_string(node[1][0]) + '1' + this.make_string(node[1][1]);
    }


    //Constructs the huffman tree back from the string for decoding purpose
   make_tree(data){
       let node = [];
       if(data[this.ind]==='\''){
           this.ind++;
           node.push(data[this.ind]);
           this.ind++;
           return node;
       }

       this.ind++;
       let left = this.make_tree(data);
       node.push(left);
       this.ind++;
       let right = this.make_tree(data);
       node.push(right);

       return node;
   }

}


///onload function
onload = function () {
   // Get reference to elements
   const box1 = document.getElementById('box1');
   const encode = document.getElementById('encode');
   const decode = document.getElementById('decode');
   const box2 = document.getElementById('box2');
   const upload = document.getElementById('uploadedFile');

   const coder = new Huffman_Encoder_Decoder();

   upload.addEventListener('change',()=>{ alert("Your File is uploaded") });

   encode.onclick = function () {

       const uploadedFile = upload.files[0];
       if(uploadedFile===undefined){
           alert("No file uploaded !");
           return;
       }
       const fileReader = new FileReader();
       fileReader.onload = function(fileLoadedEvent){
           const text = fileLoadedEvent.target.result;
           if(text.length===0){
               alert("Text can not be empty ! Upload another file !");
               return;
           }
           let [encoded, binary_string] = coder.encode(text);
           downloadFile(uploadedFile.name.split('.')[0] +'_encoded.txt', encoded);
           box1.innerText = text;
           box1.style.marginTop = '2000px';
           box2.innerText = binary_string;
       };
       fileReader.readAsText(uploadedFile, "UTF-8");
   };

   decode.onclick = function () {

       const uploadedFile = upload.files[0];
       if(uploadedFile===undefined){
           alert("No file uploaded !");
           return;
       }
       const fileReader = new FileReader();
       fileReader.onload = function(fileLoadedEvent){
           const text = fileLoadedEvent.target.result;
           if(text.length===0){
               alert("Text can not be empty ! Upload another file !");
               return;
           }
           let [decoded, binary_string] = coder.decode(text);
           downloadFile(uploadedFile.name.split('.')[0] +'_decoded.txt', decoded);
           box1.innerText = binary_string;
           box1.style.marginTop = '2000px';
           box2.innerText = decoded;
       };
       fileReader.readAsText(uploadedFile, "UTF-8");
   };

};

function downloadFile(fileName, data){
   let a = document.createElement('a');
   a.href = "data:application/octet-stream,"+encodeURIComponent(data);
   a.download = fileName;
   a.click();
}
