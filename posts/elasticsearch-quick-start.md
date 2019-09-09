---
title: ElasticSearch 项目实践
date: 2018-01-21 13:42:14
tags:
      - ElasticSearch
      - 模糊查询
---

# ES 项目实践

> 公司的搜索用到了 ES，摸索了半个月左右，终于项目上线，也是着实不易，这里总结下项目中遇到的一些问题和一些经验总结。

## 需求

首先是我们项目的需求，这里大概说明一下，我司主要做的是一个国外的房产项目，会有很多房源信息，用户在搜索的时候会希望通过房源编号，门牌号码，社区，城市等方式搜索出当前符合条件的房源。

<more></more>

## 实现

首先需要说明的是，如果是精确关键字搜索的话，倒也稍微不那么麻烦点，搜索的时候 match 关键字就好了，但是事实上有时候用户并不会记得精确的关键字，可能只知道某个房源是哪个社区的，甚至社区名字可能还会拼错，基于这种场景，我们就需要用到自动完成的功能。

自动完成一开始我们使用的是 edgeNgram，手动设置 mapping 之后，将数据以 edgeNgram 的形式进行分词,之后搜索的时候便可以进行自动完成了，这种实现方式我们最为优先考虑的现实可行的解决办法，BTW，我们之前还考虑过使用 wildcard 进行autocomplete 搜索（其他技术人员建议），稍微在 google 上搜索了一下，发现有很多人会反馈性能问题，所以这种方式我们也就直接忽略，开始使用 edgeNgram 方式来创建索引，进行搜索。

**edgeNgram 的实现原理** 

edgeNgram 分词的原理则是将一个或者多个单词拆成多个前缀相同但是长度不同的词组，比如 `Hello`，拆成 `H He Hel Hell Hello`，这样即便你输入 `Hel` 也能搜索到 `Hello` 相关的文档

下面是这种方式的 mapping,创建好 mapping 之后就可以导入数据，进行搜索了

```bash
$settingCommunityParams = [
    'index' => 'dev_community',
    'body' => [
        'settings' => [
            'number_of_shards' => 5,
            'number_of_replicas' => 1,
            'analysis' => [
                'analyzer' => [
                    'standardWithEdgeNGram' => [
                        'tokenizer' => 'standard',
                        'filter'    => ['lowercase','edgeNGram']
                    ]
                ],
                'tokenizer' => [
                    'standard' => [
                        'type'  => 'standard'
                    ]
                ],
                'filter' => [
                    'lowercase' => ['type' => 'lowercase'],
                    'edgeNGram' => [
                        'type'=> 'edgeNGram',
                        'min_gram'=> 2,
                        'max_gram'=> 15,
                        'token_chars' => ['letter','digit']
                    ]
                ]
            ]
        ],
        'mappings' => [
            'community' => [
                'properties' => [
                    'all' => [
                        'type' => 'text',
                        'analyzer' => 'standardWithEdgeNGram',
                        'search_analyzer' => 'standard'
                    ],
                    'community_plus' => [
                        'type' => 'keyword',
                        'copy_to'   => 'all'
                    ],
                    'municipality_plus' => [
                        'type' => 'keyword',
                        'copy_to'   => 'all'
                    ]
                ]
            ]
        ]
    ]
];
$client->indices()->create($settingCommunityParams);
```

关于 `edgeNgram` 细节方面的东西网上很多，我这里就不再赘述。不清楚的可以去 ES 官网查看官方文档。

## EdgeNgram 存在问题

但是之后产品反馈，在进行搜索的过程中，经常会出现一些不准确的场景，比如我输入 `25 bam` 的时候，会出现 `255 bamburge` 这样的搜索结果，这不是我们想要的，这其实也算是 `edgeNgram`  的一种特征吧，根据 `25` 关键字也能搜索 `255` 对应的文档，但是这种并不太符合我们的需求，所以之后我们进行了各种尝试，更改 `edgeNgram`  的各种 `setting`  最后都没有找到更好的办法，然后我们开始使用其他的方式来进行自动完成。

## Completion

后来就找到了 completion，在尝试了 edgeNgram 一直不行的时候，我们在网上搜索各种解决办法，发现一家同行房地产网站写了篇[博客](http://rea.tech/using-elasticsearch-completion-suggesters-for-address-autosuggest/) 来介绍 completion，以及 completion 如何在他们项目中应用的，之后我们便开始使用 completion 进行索引设置，然后重建索引。

但是 一开始也并不顺利，在尝试了几个 demo 之后，发现搜索的结果并没有和 edgeNgram 有多大的区别，还是如上面的例子一样，搜索仍然可以搜索到不精准的结果，所以我们一开始就放弃了 completion 的尝试，转而在搜索的时候尝试去使用 prefix 的方式进行搜索，最后发现 prefix 这个东西也只是仅仅能实现而已，性能方面并没有太好，而且只是单纯的去匹配前缀，如果我搜索多个词，这个 prefix 可能就不那么好使了，最后又转而回去 completion 重新试了一下，随便瞎捣鼓，更改了一下mapping 的分词器，设置为  `standard`  ,之后便可以如我们预期的那样，（也可能是其他设置之类的，这里有点不求甚解，反正最后是成功了）

```bash
$settingParams = [
    'index' => 'dev_address',
    'body' => [
        'mappings' => [
            'address' => [
                'properties' => [
                    'all' => [
                        'type' => 'completion',
                        'analyzer' => 'standard',
                        'search_analyzer' => 'standard'
                    ],
                    'addr' => [
                        'type' => 'keyword'
                    ],
                    'apt_num' => [
                        'type' => 'keyword'
                    ],
                    'municipality_plus' => [
                        'type' => 'keyword'
                    ],
                    'ml_num' => [
                        'type' => 'keyword'
                    ],
                    'community_plus' => [
                        'type' => 'keyword'
                    ]
                ]
            ]
        ]
    ]
];
$client->indices()->create($settingParams);
```

然后 completion 要多嘴一句，你如果想不同的关键字能够同时定位到同一个文档的话，在创建索引的时候添加关键字即可，比如

```bash
# 官方实例
PUT music/song/1?refresh
{
    "suggest" : [
        {
            "input": "Nevermind",
            "weight" : 10
        },
        {
            "input": "Nirvana",
            "weight" : 3
        }
    ]
}

# 搜索 nevermind 和 nirvana 都能定位到 song/1 这条文档，只是权重不同。
```

## 如果搜索不到文档

因为这种方式是基于精确匹配（和 prefix 的区别请自行了解，这里不做赘述，好吧，实际上是我暂时还不知道），所以有时候会有搜不到文档的时候，所以我们又多做了一步，添加 edgeNgram 分词，用户在搜索地址的时候如果没有搜索到，便使用这种方式进行二次搜索将结果返回给用户，不准确的结果总比没有结果要好看，基于这样的考虑，我们在 PHP 接口中做了逻辑判断来进行数据返回。

## 最后

还有一些细节方面的东西，比如 completion 搜索结果排序，edgeNgram 搜索结果自定义评分来实现自定义排序等我们做了但是没说的，后续可能再开新的篇幅把这些细节的东西说一说。

另，推荐中华石杉的 ES 课程，虽然不推荐盗版，但是淘宝能买到哦..（吐槽一句，这货讲课特别啰嗦，一个小功能能拆成 N 课时去讲）