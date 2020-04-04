$(document).ready(function(){

    loadProducts();

    $("#insert").click(function(){
        addRowInCart();
    });

    $(document).on("click",".close",function(){
        $(this).parent().parent().remove();
        refreshTotalSum();
    });

    $(document).on("change",".products", function(){

        let product=$(this);
        let quantity=$(this).parent().next().children("div").children(":input");

        if(!chechQuantityAndProduct(quantity,product))
            return;
        
        $(this).parent().next().next().children("label").html(calculateSum(quantity,product));
        refreshTotalSum();
        refreshProductsDDL()

    });

    $(document).on("keyup",".quantity",function(){

        let quantity=$(this);
        let product=$(this).parent().parent().prev().children("select");

        if(!chechQuantityAndProduct(quantity,product))
            return;

        $(this).parent().parent().next().children("label").html(calculateSum(quantity,product));
        refreshTotalSum();

    });

    $("#send").click(function(){

        let data=[];
        let flag=0;

        $(".cart-row").each(function(){

            let quantity=$(this).children("td").children("div").children(":input");
            let product=$(this).children("td").children("select");
            let price=$(this).children("td").children("label");

            if(!chechQuantityAndProduct(quantity,product)){
                flag++;
                return;
            }
            
            data.push({
                product:product.val(),
                quantity:quantity.val(),
                totalPrice:price.text()
            });

        });

        if(flag){return;}

        sendCart(data);
    
    });


});

function refreshProductsDDL(){
    $(".cart-row").each(function(){

        let id=$(this).children("td").children("select").val();
        let products=getFreeProducts();
        if(id!=0){
            let product=getProduct(id);
            products.push(product);
            products=sortProducts(products);
        }

        let print=`<option value="0">Choose product</option>`;

        for(let i of products){
            if(i.id==id){
                print+=`<option selected value="${i.id}">${i.name}</option>`;
            }
            else{
                print+=`<option value="${i.id}">${i.name}</option>`;
            }
        }

        $(this).children("td").children("select").html(print);
    });
}

function sendCart(data){

    $.ajax({
        url:"obrada.php",
        method:"post",
        dataType:"json",
        data:{send:data},
        success:function(data,status,xhr){
            if(xhr.status===201){
                alert("Succeful shopping!");
                $("#table-body").html("");
                $("#total-sum").html("0");
            }
        },
        error:function(xhr,status,error){
            console.log(xhr.status);
        }
    });

}

function addRowInCart(){
    let products=getFreeProducts();

    if(!products.length){
        return;
    }

    let print=`<tr class="cart-row">
                    <td>
                        <select class="browser-default products">
                            <option value="0">Choose product</option>;`
                            
                            for(let i of products){
                                print+=`<option value="${i.id}">${i.name}</option>`;
                            }

                        print+=`</select>
                    
                    </td>
                    <td>
                        <div class="input-field col s12">
                            <input type="text" class="validate quantity" value="1" placeholder="Quantity">
                        </div>                       
                    </td>
                    <td>
                        <label class="sum">0</label>
                    </td>
                    <td>
                        <button class="waves-effect waves-light btn close" type="button"><i class="large material-icons">close</i></button>
                    </td>
            </tr>`;

            $("#table-body").append(print);
}

function loadProducts(){
    $.ajax({
        url:"data/products.json",
        method:"get",
        dataType:"json",
        success:function(data){
            setProductsToLocalStorage(data);
        },
        error:function(xhr,status,error){
            console.log(xhr.status);
        }
    });
}

function setProductsToLocalStorage(data){
    localStorage.setItem('products',JSON.stringify(data));
}

function getProducts(){
    return JSON.parse(localStorage.getItem('products'));
}

function checkQuantity(quantity){
    let reg=/^[0-9]+$/;

    if(!reg.test(quantity.val())){
        return false;
    }

    return true;
}

function checkProduct(product){
    if(product.val()=="0")
        return false;

    return true;
}

function chechQuantityAndProduct(quantity,product){

    let flag=0;

    if(!checkQuantity(quantity)){
        quantity.addClass('borderBottomRed');
        flag++;
    }
    else{
        quantity.removeClass('borderBottomRed');
    }

    if(!checkProduct(product)){
        product.addClass('borderRed');
        flag++;
    }
    else{
        product.removeClass('borderRed');
    }

    if(flag)
        return false;
    
    return true;

}

function calculateSum(quantity,selected){

    let sum=0;
    let quant=Number(quantity.val());
    let product=getProduct(selected.val());

    if(quant<=10){
        sum=quant*product.price1;
    }
    else{
        sum=quant*product.price2;
    }

    return sum;
}

function getProduct(id){
    return getProducts().filter(p=>p.id==id)[0];
}

function getFreeProducts(){
    
    let ids=$(".products").map(function(){
        return Number($(this).val());
    }).toArray();

    let products=getProducts().filter(function(el){
        return !ids.includes(el.id);
    });

    return products;
}

function refreshTotalSum(){
    let totalSum=0;

    $(".cart-row").each(function(){
        let quantity=$(this).children("td").children("div").children(":input");
        let product=$(this).children("td").children("select");

        if(!checkQuantity(quantity)){return;}
        if(!checkProduct(product)){return;}

        totalSum+=calculateSum(quantity,product);
    });

    $("#total-sum").text(totalSum);
}

function removeFromTotalSum(sum){
    let existingSum=Number($("#total-sum").text());
    existingSum-=sum;
    $("#total-sum").text(existingSum);
}

function sortProducts(data){

    data.sort(function(a,b){
        if(a.id==b.id)return 0;
        return a.id<b.id?-1:1;
    });

    return data;
}
