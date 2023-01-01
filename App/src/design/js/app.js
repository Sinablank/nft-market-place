$(function () {
    $(window).load(function () {
        PrepareNetwork();
    });
});

var NFTContract = null;
var NFTmarketContract = null;
var web3 = null;
var JsonContractNC = null;
var JsonContractNM = null;
var CurrentAccount = null;
var Content = null;
var IPFS_Hash = null;
var networkDataNC = null;
var networkDataNM = null;
var ListingPrice = null;

var Host_Name = 'https://ipfs.infura.io/ipfs/';
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
    await LoadMainPage();
    await LoadAuthorPage();
    await LoadMyNFTPage();
}

function makeHttpObject() {
    if ("XMLHttpRequest" in window) return new XMLHttpRequest();
    else if ("ActiveXObject" in window) return new ActiveXObject("Msxml2.XMLHTTP");
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            setCurrentAccount();
        });
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

    web3.eth.handleRevert = true;
}

function setCurrentAccount() {
    $('#Address').text(CurrentAccount);
    $('#addressAU').text(CurrentAccount);
    // addressAU
}

async function handleAccountChanged() {
    await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
        window.location.reload();
    });
}

async function handleChainChanged(_chainId) {

    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {

    await $.getJSON('NFTMarket.json', function (contractData) {
        JsonContractNM = contractData;
    });

    await $.getJSON('MakeNFT.json', function (contractData) {
        JsonContractNC = contractData;
    });

  //   console.log("JsonContractNM",JsonContractNM);
   //  console.log("JsonContractNC",JsonContractNC);

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log("networkId",networkId);
    networkDataNC = JsonContractNC.networks[networkId];
    networkDataNM = JsonContractNM.networks[networkId];

   //  console.log("networkDataNC",networkDataNC);
   //  console.log("networkDataNM",networkDataNM);

    if (networkDataNC && networkDataNM) {

       //  console.log("JsonContractNM.abi",JsonContractNM.abi);
       //  console.log("networkDataNM.address",networkDataNM.address);
       //  console.log("JsonContractNC.abi",JsonContractNC.abi);
       //  console.log("networkDataNC.address",networkDataNC.address);

        NFTmarketContract = new web3.eth.Contract(JsonContractNM.abi, networkDataNM.address);
        NFTContract = new web3.eth.Contract(JsonContractNC.abi, networkDataNC.address);

        ListingPrice = await NFTmarketContract.methods.getListingPrice().call();
        console.log("ListingPrice: ",ListingPrice);
        
    }

    $(document).on('click', '#CreateItemNFT', CreateItemNFT);

}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getImageSRC(imgURL) {

    var request = makeHttpObject();
    request.open("GET", imgURL, true);
    request.send(null);

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            Content = request.responseText;
       //     console.log("Content: ",Content);
        }
    }

    
}


async function LoadAuthorPage() {

    // console.log("NFTmarketContract: ", NFTmarketContract);
    var ItemsOwner = await NFTmarketContract.methods.ShowNFTCreatedMarketItem().call();
    console.log("ItemsOwner1: ", ItemsOwner);
    
    for (let index = ItemsOwner.length-2; index >= 0; index--) {
        // ItemsOwner[index];
        getImageSRC(ItemsOwner[index].tokenURI);
        await sleep(100);
        // console.log("ItemsOwner[index].price : ",ItemsOwner[index].price);
        var htmlTagC = 
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >'+
              '<div class="creators">'+
                    '<div class="creatorImg"><img id="image_nft" src='+Content+' alt="img"></div>'+
                '</div>'+
                '<div class="creatorsText text-center">'+
                '<h2 class="textwhitecolor">'+ItemsOwner[index].itemName+'</h2>'+
                '<h3 class="textbluecolor">@'+ItemsOwner[index].itemDescription+'</h3>'+
                '<div class="authorEarn text-center mt-2">'+
                    '<div class="">'+
                        '<span class="textgraycolor">Price</span>'+
                        '<strong class="textwhitecolor"><img class="img-fluid" src="img/priceicon.svg" alt="img">'+web3.utils.fromWei( ItemsOwner[index].price, 'ether')+'</strong>'+
                    '</div>'+

                '</div>'+
             '</div>'+
            '</div>';



    $("#itemAuthor").append(htmlTagC);
        
    }

}

async function LoadMyNFTPage() {

    // console.log("NFTmarketContract: ", NFTmarketContract);
    var ItemsOwner = await NFTmarketContract.methods.ShowMyNFTMarketItem().call();
    console.log("ItemsOwner2: ", ItemsOwner);
    
    for (let index = ItemsOwner.length-2; index >= 0; index--) {
        // ItemsOwner[index];
        getImageSRC(ItemsOwner[index].tokenURI);
        await sleep(100);
        // console.log("ItemsOwner[index].price : ",ItemsOwner[index].price);
        var htmlTagC = 
            '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >'+
              '<div class="creators">'+
                    '<div class="creatorImg"><img id="image_nft" src='+Content+' alt="img"></div>'+
                '</div>'+
                '<div class="creatorsText text-center">'+
                '<h2 class="textwhitecolor">'+ItemsOwner[index].itemName+'</h2>'+
                '<h3 class="textbluecolor">@'+ItemsOwner[index].itemDescription+'</h3>'+
                '<div class="authorEarn text-center mt-2">'+

                '<div class="col-md-2">'+
                    // '<span class="textgraycolor">Price</span>'+
                    // '<strong class="textwhitecolor"><img class="img-fluid" src="img/priceicon.svg" alt="img">'+web3.utils.fromWei( ItemsOwner[index].price, 'ether')+'</strong>'+
                    // '<div class="row">'+
                    //     '<div class="col-md-8">'+
                    //         '<input type="text" class="" value="Sell" style="margin-top:10px;" >'+
                    //     '</div>'+
                    //     '<div class="col-md-4">'+
                    //         '<input type="button" class="btn btn-success" value="Sell" style="margin-top:10px;" >'+
                    //     '</div>'+
                    // '</div>'+
                    
                    // '<input type="number" id="pricesell" style="margin-top:10px;" placeholder="ether">'+
                    // '<br/>'+
                    // '<input type="button" class="btn btn-success" value="Sell(ether)" style="margin-top:10px;" onclick = "TransferNFT('+ ItemsOwner[index].itemId +')">'+

                '</div>'+
                // '<div class="col-md-6">'+
                //     '<input type="button" class="btn btn-success" value="Buy" onclick = "TransferNFT('+ ItemsOwner[index].itemId +')">'+
                // '</div>'+
                '</div>'+
             '</div>'+
            '</div>';



    $("#itemnftAuthor").append(htmlTagC);
        
    }

}

async function LoadMainPage() {

    var ItemsSell = await NFTmarketContract.methods. ShowMarketItem().call(); 
    console.log("itemSell: ",ItemsSell);

    for (let index = ItemsSell.length - 1; index >= 0; index--) {
        getImageSRC(ItemsSell[index].tokenURI);
        await sleep(100);
        sellernft = ItemsSell[index].seller.slice(0, 6) + "..." + ItemsSell[index].seller.slice(38, 42);

        var htmlTagC = 
        '<div class="col-md-6 col-lg-4 col-xl-3 mb-4-nft" >'+
        '<div class="creators">'+
              '<div class="creatorImg"><img id="image_nft" src='+Content+' alt="img"></div>'+
          '</div>'+
                    '<div class="bgdarkbluecolor aboutitemcnt">'+
                        '<div class="itemtitlecode">'+
                            '<h2 class="textgraycolor">'+ItemsSell[index].itemName+'</h2>'+
                            '<h3 class="textwhitecolor">@'+ItemsSell[index].itemDescription+'</h3>'+
                            '<h4 style="color: white;">Seller:'+sellernft +'</h4>'+
                        '</div>'+
                        '<div class="itemtitlePrice">'+
                            '<h2 class="textgraycolor">Price</h2>'+
                            '<h3 class="textwhitecolor"><img src="img/priceicon.svg"> <strong>'+web3.utils.fromWei( ItemsSell[index].price, 'ether')+'</strong></h3>'+
                            '<input type="button" class="btn btn-success" value="Buy" onclick = "BuyNFT('+ ItemsSell[index].itemId +')">'+
                        '</div>'+
                    '</div>'+
                  
                '</div>'+
            '</div>';

        $("#BuyNFT").append(htmlTagC);
    }

    
}

async function BuyNFT(id) {

    var item = await NFTmarketContract.methods.getItems(id).call();
    console.log("item: ",item);

    NFTmarketContract.methods.SellMarket(item.nftContract ,id).send({ from: CurrentAccount, value: item.price }).then(function (Instance) {
        $.msgBox({
            title: "You Buy",
            content: "New Owner: " + CurrentAccount.slice(0, 6)+ "..."+CurrentAccount.slice(38, 42),
            type: "alert"
        });
    }).catch(function (error) {
        console.log("error: ", error);
    });;


    
}


function readURL(input) {

    if (input.files && input.files[0]) {
        const file = input.files[0];
        var reader = new FileReader(file);
        reader.readAsDataURL(file);

        reader.onload = async function (e) {

            $('.image-upload-wrap').hide();

            $('.file-upload-image').attr('src', e.target.result);
            $('.file-upload-content').show();

            $('.image-title').html(input.files[0].name);

            Content = reader.result;

            $("#overlay").fadeIn(300);

            await ipfs.add(Content, function (err, hash) {
                if (err) {
                    console.log(err);
                    return false;
                }else{
                    IPFS_Hash = hash;
                    console.log("IPFS_Hash", IPFS_Hash);
                    $("#overlay").fadeOut(300);
                }
            });

            
        }
        
    }else{
        removeUpload();
    }
    
}

function CreateItemNFT() {

    var price = $("#price").val();
    var itemname = $("#itemname").val();
    var description = $("#description").val();

    if (description.trim() == '' & price.trim() == '' & itemname.trim() == '') {
        $.msgBox({
            title: "Alert Box",
            content: "Please Fill Description!",
            type: "error"
        });
        return;
    }

    price = web3.utils.toWei(price, 'ether');
    var TokenURI = Host_Name + IPFS_Hash;

    let tokenId = null;

    NFTContract.methods.createToken(TokenURI).send({ from: CurrentAccount }).then(function (Instance) {

        tokenId = Instance.events.Mint.returnValues[1];
        console.log("tokenId", tokenId);

        Oaddress = Instance.events.Mint.returnValues[0];

        $.msgBox({
            title: "NFT Created",
            content: "Owner: " + Oaddress.slice(0, 6)+ "..."+Oaddress.slice(38, 42),
            type: "alert"
        });


        NFTmarketContract.methods.ListMarketItem(networkDataNC.address, tokenId, price, itemname, description, TokenURI).send({ from: CurrentAccount, value:ListingPrice }).then(function (Instance) {

            let Oaddress = Instance.events.MarketItemCreated.returnValues[3];

            $.msgBox({
                title: "NFT Save to NFT Market",
                content: "Seller: " + Oaddress.slice(0, 6)+ "..."+Oaddress.slice(38, 42),
                type: "alert"
            });
    

        }).catch(function (error) {
            console.log("error: ", error);
        });

    }).catch(function (error) {
        console.log("error: ", error);
    });
    
}




function CreatePage() {
    location.replace("create.html")
}

function MyNFT() {
    location.replace("mynft.html")
}

function MyMarketNFT() {
    location.replace("author.html")
}

function back() {
    location.replace("index.html")
}